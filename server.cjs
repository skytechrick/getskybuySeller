import('./app.js').then((module) => {
    const app = module.default;

    app.listen(process.env.PORT, () => {
        console.log(`Server is listening on port ${process.env.PORT}`);
    })
})