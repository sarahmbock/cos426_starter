# COS 426 Final Project: Giggling Gardens
To see our project running live on the web, check out the [Online Demo](https://sarahmbock.github.io/cos426finalproject/)
To watch a simulated game with explanations, check out the [Video Demo](https://drive.google.com/file/d/1--aFBH2o4Lu5rlLAVNk25kY3Vb_ri-Xr/view?usp=sharing)

## Installation on your own computer
Having made your own copy of the project at Github you can clone your repository to your own computer. 

To build this project, you will need to use Node Package Manager (npm) to manage and install project dependencies. All npm settings, as well as your project dependencies and their versionings, are defined in the file `package.json`. We will unpack this file in the next section.

Node Package Manager, which is the world's largest software registry and supports over one million open source JavaScript packages and libraries, runs in a NodeJS runtime. The NodeJS runtime is essentially a port of Google Chrome's JavaScript V8 engine that will run directly in your terminal (instead of within a browser).

Before you begin, you will need to install [Node and npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm). Then, open a new terminal instance, set your working directory to the root of the project, and run `npm install`.

## Launching a Local Webserver
Now that your development environment is ready to go, you can spin up a local development webserver using `npm start`. This command will bundle the project code and start a development server at [http://localhost:8080/](http://localhost:8080/). Visit this in your web browser; every time you make changes to the code, *the page will automatically refresh!* If you did everything correctly, you should see something that looks like [this](https://adamfinkelstein.github.io/cos426finalproject/) in your browser. Congratulations --- now you are ready to work!

## CC Attributes and Credits

This skeleton project was adapted from edwinwebb's ThreeJS [seed project](https://github.com/edwinwebb/three-seed) by Reilly Bova (Princeton ’20), and published [here on github](https://github.com/ReillyBova/three-seed). It was later slightly updated and setup as a github template by Adam Finkelstein and Joseph Lou, and is hosted [here on github](https://github.com/adamfinkelstein/cos426finalproject).

## License
[MIT](./LICENSE)
