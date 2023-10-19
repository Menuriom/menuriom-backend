1.setup a bash file:

+++++++++++++++++++++++
#!/bin/bash

# Pull the latest Docker image
docker-compose pull

# Recreate the container(s)
docker-compose up -d
```
+++++++++++++++++++++++

2.make an executable:

+++++++++++++++++++++++
chmod +x update-container.sh
```
+++++++++++++++++++++++

3.set up a file watcher (inotifywait):

+++++++++++++++++++++++
# Install inotify-tools
sudo apt-get install inotify-tools

# Start the file watcher
while true; do
    inotifywait -e modify,move,create,delete -r /path/to/directory && ./update-container.sh
done
```
+++++++++++++++++++++++

Replace `/path/to/directory` with the actual directory path where the shell script and `docker-compose.yml` file are located.

4.alt => we can use a cronjob