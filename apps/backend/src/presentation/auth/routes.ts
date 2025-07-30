import { Router } from 'express';


export class AuthRoutes {


    get routes():Router{

        const router = Router();

        router.post('/login', (req,res)=>{
            res.json('Login');
        })

        router.post('/register', (req,res)=>{
            res.json('Register');
        })
        return router;
    }
}