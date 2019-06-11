# Math: Battle Royale
A battle royale game, written in Node.js. Still in extreme WIP format.

## Running
Use instructions from [nodejs.org](https://nodejs.org) to install Node.js on your computer. If you need help, check out one of the many helpful online tutorials. Please do not open an issue here.
After installing Node.js, use `setup.sh` the first time you run it in order to set up the directory. Then, use `./math_battle_royale.sh` at any time to run. This script will run the code locally on your computer, and only others on your network will be able to join your room (unless you forward the port the game is running on using your router configuration). 

## Using an alternative set of questions
The `questions.txt` file contains the questions and answers the program uses. It consists of a question, newline, answer, and newline, repeated once per question. If you have a file formatted like this with alternative questions that you would like to use, just replace `questions` with it (please don't forget you did that and commit it, though). Remember, the questions do not even have to be math-related.

## To collaborators
Please test all changes to master extensively before pushing. Automatic deploy to Heroku is enabled. If you don't want to do this, make your changes in another branch. If you break something, I will be sad.

