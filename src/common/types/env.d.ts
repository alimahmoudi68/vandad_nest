namespace NodeJS{
    interface ProcessEnv{
        //Application
        PORT: number

        //Database
        DB_PORT: string 
        DB_NAME: string
        DB_USERNAME : string
        DB_PASSWORD : string
        DB_HOST: string

        //JWT
        ACCESS_TOKEN_SECRET : string
        REFRESH_TOKEN_SECRET : string

        //S3
        S3_BUCKET_NAME : string
        S3_ACCESS_KEY : string
        S3_SECREt_KEY : string
        S3_ENDPOINT : string
    }
}