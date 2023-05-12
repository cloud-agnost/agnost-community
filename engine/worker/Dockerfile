# Get the base node image from docker hub, we are not using alpine since shart library requires some modules that are not included in alpine version
FROM node:18
# Set the working directory in our docker image, anything that is copied from now on
# from local machine to the image will be moved under '/app' directory in docker image
WORKDIR '/app'
# Copy package.json file from local machine to the image under '/app' directory
COPY ./package.json ./
# Run npm install to install dependent modules
RUN npm install
# Copy everhting to the image under '/app' directory
COPY ./ ./
# This will be the start up command of the docker container, run the development react server
CMD [ "npm", "run", "prod" ]

