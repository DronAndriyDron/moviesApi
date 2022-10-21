'use strict';
require('dotenv').config()
import {Request, Response} from "express"
import {$omdApi} from './Util/axiosBase';

const cors = require('cors')

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {validationResult} = require('express-validator')
const authMiddleware = require('./MiddleWare/authMiddleware')

import {Users} from "./Entities/user.entity"
import {DataSource, ILike} from "typeorm";
import {Movie} from "./Entities/movie.entity";
import {Favorite} from "./Entities/favorite.entity";

const express = require('express');

const dbport = parseInt(process.env.DB_PORT as string) || 5432;
const myDataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST,
    port: dbport,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    entities: [`${__dirname}/../**/*.entity.{js,ts}`],
    logging: true,
    synchronize: true,
})

const PORT = process.env.PORT || 3000;
myDataSource
    .initialize()
    .then(() => {
        console.log("Data Source has been initialized!")
    })
    .catch((err) => {
        console.error("Error during Data Source initialization:", err)
    })

// create and setup express app
const app = express()
app.use(express.json())
app.use(cors())

const generateAccessToken = (id: number, email: string) => {
    const payload = {
        id,
        email
    }
    return jwt.sign(payload, process.env.JWT_SECRET, {expiresIn: "24h"})
}

app.post('/auth/register', async (req: Request, res: Response) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({message: "registration error", errors})
        }
        const {email, password} = req.body;

        const candidate = await myDataSource.getRepository(Users).findOneBy({
            email: email,
        })
        if (candidate) {
            return res.status(400).json({message: "User already exist"})
        }
        const hashPassword = bcrypt.hashSync(password, 7);
        const user = new Users();
        user.email = email;
        user.password = hashPassword;
        await myDataSource.getRepository(Users).save(user);
        return res.json({message: "user successfully sign up"})
    } catch (e) {
        console.log(e)
        res.status(400).json({message: 'Registration error'})
    }
})
app.post('/auth/login', async (req: Request, res: Response) => {
    try {
        const {email, password} = req.body
        const user = await myDataSource.getRepository(Users).findOneBy({
            email: email
        })
        if (!user) {
            return res.status(400).json({message: `User ${email} not exist`})
        }
        const validPassword = bcrypt.compareSync(password, user.password)
        if (!validPassword) {
            return res.status(400).json({message: `Incorrect password entered`})
        }
        const token = generateAccessToken(user.id, user.email)
        return res.json({token})
    } catch (e) {
        console.log(e)
        res.status(400).json({message: 'Login error'})
    }
})
app.post('/movies', authMiddleware, async (req: any, res: Response) => {
    const {Title, Runtime, Genre, Director, Poster, Year} = req.body;
    const movie = new Movie();
    let unicId = "" + Date.now();
    unicId = unicId.substring(unicId.length - 7, unicId.length)
    movie.Genre = Genre;
    movie.Director = Director;
    movie.Poster = Poster;
    movie.Runtime = Runtime;
    movie.Title = Title;
    movie.Year = Year;
    movie.isDeleted = false;
    movie.imdbID = "tt" + unicId;
    const saved = await myDataSource.getRepository(Movie).save(movie);


    res.status(200).json({
        imdbID: saved.imdbID,
    })


})
app.get('/movies', authMiddleware, async (req: any, res: Response) => {


    const movies = await myDataSource.getRepository(Movie).find({
        where: {
            Title: ILike(`%${req.query.search}%`)
        }
    })
    if (movies.length > 0) {
        res.status(200).json({
            movies: movies
        });
    } else {
        try {
            const {data} = await $omdApi.get('/', {
                params: {
                    s: req.query.search
                }
            });

            res.status(200).json({
                movies: data.Search
            });
        } catch (e) {
            res.status(500).json({
                error: e
            })
        }


    }


})
app.get('/movies/:imdbID', authMiddleware, async (req: Request, res: Response) => {


    const movie = await myDataSource.getRepository(Movie).findOneBy({
        imdbID: req.params.imdbID,
        isDeleted: false
    })

    if (movie) {
        res.status(200).json({
            movie
        });
    } else {
        const {data} = await $omdApi.get('/', {
            params: {
                i: req.params.imdbID
            }
        });
        if (data) {
            res.status(200).json({
                movie: data
            });
        } else {
            res.status(400).json({
                message: "NOT FOUND"
            })
        }
    }


})
app.delete('/movies/:imdbID', authMiddleware, async (req: any, res: Response) => {


    const movie = await myDataSource.getRepository(Movie).findOneBy({
        imdbID: req.params.imdbID
    })

    if (movie) {
        const favorites = await myDataSource.getRepository(Favorite).find({
            where: {
                movie: movie
            }
        })

        if (favorites.length > 0) {
            const favoritesIds = favorites.map(el => {
                return el.id
            })


            await myDataSource.getRepository(Favorite).delete(favoritesIds)
        }
        await myDataSource.getRepository(Movie).delete(movie)
    }

    res.status(200).json({
        message: "deleted"
    })

})
app.post('/addToFavorite/:imdbID', authMiddleware, async (req: any, res: Response) => {

    const user = await myDataSource.getRepository(Users).findOneBy({
        id: +req.user.id
    })

    if (user) {
        const movie = await myDataSource.getRepository(Movie).findOneBy({
            imdbID: req.params.imdbID
        })
        if (movie) {
            const favorite = new Favorite();
            favorite.user = user;
            favorite.movie = movie;
            const saved = await myDataSource.getRepository(Favorite).save(favorite);

            res.status(200).json({
                favorite: saved
            })
        } else {

            try {
                const {data} = await $omdApi.get('/', {
                    params: {
                        i: req.params.imdbID
                    }
                });
                let unicId = "" + Date.now();
                unicId = unicId.substring(unicId.length - 7, unicId.length)
                const newMovie = new Movie();

                newMovie.Title = data.Title;
                newMovie.imdbID = "tt" + unicId;
                newMovie.Poster = data.Poster;
                newMovie.Year = data.Year;
                newMovie.Genre = data.Genre;
                newMovie.Director = data.Director;
                newMovie.Runtime = data.Runtime;
                newMovie.isDeleted = false;
                const savedMovie = await myDataSource.getRepository(Movie).save(newMovie);

                const favorite = new Favorite();
                favorite.user = user;
                favorite.movie = savedMovie;
                const saved = await myDataSource.getRepository(Favorite).save(favorite);
                res.status(200).json({
                    favorite: saved
                });
            } catch (e) {
                res.status(400).json({
                    message: "movie not found"
                })
            }
        }
    } else {
        res.status(400).json({
            message: "user not found"
        });
    }


})
app.get('/favorites',authMiddleware,async(req:any,res:Response)=>{
    const user = await myDataSource.getRepository(Users).findOneBy({
        id: +req.user.id
    })
    if(user)
    {
        const result = await myDataSource.getRepository(Favorite).find({
            where:{
                user:user
            },
            relations:['user','movie']
        })


        const movies = result.map(el=>{
            return el.movie
        })

        res.status(200).json({
           movies
    })
    }
    else {
        res.status(400).json({
            message: "user not found"
        });
    }


})
app.patch('/updateMovie/:imdbID',authMiddleware,async (req:any,res:Response)=>{

    const movie = await  myDataSource.getRepository(Movie).findOneBy({
        imdbID:req.params.imdbID
    })
    if(movie)
    {
        if(req.body?.Year)
        {
            movie.Year=req.body.Year;
        }
        if(req.body?.Director)
        {
            movie.Director=req.body.Director;
        }
        if(req.body?.Runtime)
        {
            movie.Runtime=req.body.Runtime;
        }
        if(req.body?.Genre)
        {
            movie.Genre=req.body.Genre;
        }
        if(req.body?.Title)
        {
            movie.Title=req.body.Title
        }
        if(req.body?.Poster)
        {
            movie.Poster=req.body.Poster;
        }

        const saved = await myDataSource.getRepository(Movie).save(movie);

        res.status(200).json({
            movie:saved
        })

    }
    else{
        try {
            const {data} = await $omdApi.get('/', {
                params: {
                    i: req.params.imdbID
                }
            });
            let unicId = "" + Date.now();
            unicId = unicId.substring(unicId.length - 7, unicId.length)
            const newMovie = new Movie();

            newMovie.Title = data.Title;
            newMovie.imdbID = "tt" + unicId;
            newMovie.Poster = data.Poster;
            newMovie.Year = data.Year;
            newMovie.Genre = data.Genre;
            newMovie.Director = data.Director;
            newMovie.Runtime = data.Runtime;
            newMovie.isDeleted = false;
            if(req.body?.Year)
            {
                newMovie.Year=req.body.Year;
            }
            if(req.body?.Director)
            {
                newMovie.Director=req.body.Director;
            }
            if(req.body?.Runtime)
            {
                newMovie.Runtime=req.body.Runtime;
            }
            if(req.body?.Genre)
            {
                newMovie.Genre=req.body.Genre;
            }
            if(req.body?.Title)
            {
                newMovie.Title=req.body.Title
            }
            if(req.body?.Poster)
            {
                newMovie.Poster=req.body.Poster;
            }
            const savedMovie = await myDataSource.getRepository(Movie).save(newMovie);

            res.status(200).json({
                movie:savedMovie
            })


        } catch (e) {
            res.status(400).json({
                message: "movie not found"
            })
        }
    }


})
app.delete('/removeFavorite/:imdbID',authMiddleware,async(req:any,res:Response)=>{

    const favorite = await myDataSource.getRepository(Favorite).findOneBy({
        movie:{
            imdbID:req.params.imdbID
        }
    })

    if(favorite)
    {
        await myDataSource.getRepository(Favorite).delete(favorite)
    }

    res.status(201).json({
        message:"deleted"
    })

})


app.listen(PORT);
console.log(`Running on http://${PORT}`);