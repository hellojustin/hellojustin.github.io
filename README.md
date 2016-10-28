Make sure you have node js installed:

    brew install node

Install ruby dependencies, mainly sass & compass:

    bundle install

Install node dependencies (tooling):

    npm install

To use locally-installed node dependencies, add the following alias command to
your .bashrc, .zshrc, .<whatever>rc file:

    alias npm-exec='PATH=$(npm bin):$PATH'

Install bower dependencies (build dependencies):

    npm-exec bower install

Fire up grunt to compile SASS files on change:

    npm-exec grunt
