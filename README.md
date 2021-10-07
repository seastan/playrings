# DragnCards
Multiplayer online card game written in Elixir, Phoenix, React, and Typescript.



## Local Instnace

The local instance of Dragncards serves a purpose for those looking to develop, contribute, or play Dragncards in an offline environment.

### Pre Requisites

This environment uses HashiCorp Vagrant to stand up Dragncards within a virtual machine. This requires the following:

* HashiCorp Vagrant https://www.vagrantup.com/
* Virtual Box - https://www.virtualbox.org/

These can be installed on macOS, Windows, or Linux.

### Run Dragncards

- Clone the Dragncards repository locally
  - `git clone https://github.com/seastan/dragncards`
- From the `dragncards` change to the `vagrant` folder
  - `cd vagrant`
- Run Vagrant
  - `vagrant up`

Once this is done browse do `http://127.0.0.1:3000`.

### Default Users

The default users are
```
player1@dragoncards.com password1
player2@dragoncards.com password2
player3@dragoncards.com password3
player4@dragoncards.com password4
```
If you prefer different names please update the `alias` value in `vagrant/sql/users.sql` and run vagrant up.


### Multiplayer

If you're interested in running multiplayer games where others connect to your instance you will require the following changes. Where IPADDRESS is located down below you will need to change

NOTE: This must be done each time you rebuild as this is a deviation from the main branch.

Replace `127.0.0.1` with your required IPADDRESS. This may be a public IP, private IP, or something else. 
**dragncards/frontend/package.json**
```
    "start": "REACT_APP_WS_URL=ws://127.0.0.1:4000/socket npm-run-all -p start:js",
  
    "start": "REACT_APP_WS_URL=ws://IPADDRESS:4000/socket npm-run-all -p start:js",
```

**dragncards/backend/config/config.exs**

The backend can listen on any addressed opposed to localhost. Comment out the following and replace with `0.0.0.0`
```
  url: [host: "0.0.0.0"],
  #url: [host: "localhost"],
```

