'use strict'
let prompt = require('prompt')
prompt.message = ''
prompt.delimiter = ''
let promptSchema = {
  properties: {
    answer: {
      description: '~',
      message: ''
    }
  }
}

 
// Constructors \\
function Player(name, location) {
  this.name = name
  this.inventory = []
  this.location = location
  this.health = 10
}

Player.prototype.checkInventory = function () {
  let items = this.inventory.map(function(ele) {return ele.name})
  console.log(`You are carrying ${items.join(', ') || 'nothing'}.`)
}

Player.prototype.checkHealth = function() {
  console.log(`You have ${this.health} health`)
}

Player.prototype.useItem = function(itemName) {
  let item = this.inventory.filter(function(ele) {
    if (ele.name == itemName) {
      console.log(`you use the ${ele.name}.`)  
      return true 
    }
    return false
  })[0]

  item.use(this)
}


Player.prototype.addItem = function(itemName) {
  let item = this.location.getItem(itemName)
  if (item != []) {
   this.inventory.push(item)
   return console.log('and put it into your bag')
  }

  console.log('That item doesn\'t exist.') 
}

Player.prototype.move = function(newLocation) {
  try {
  this.location = this.location.directions[newLocation]
  console.log(`You move to the ${newLocation}`)
  }
  catch (err) {
    console.log('Sorry, that location doesn\'t exist.') 
  }
}

function PaladinPlayer(name, location) {
  this.name = name
  this.inventory = []
  this.location = location
  this.health = 10
}

PaladinPlayer.prototype.addItem = function(itemName) {
  console.log('You can\'t pick that up, that\'s not yours!')
}

PaladinPlayer.__proto__ = Player

function Item(name, description, use) {
  this.name = name
  this.description = description
  this.use = use
}

function Room(description, directions, items) {
  this.description = description
  this.directions = directions
  this.items = items
}

Room.prototype.look = function() {
  console.log(this.description)
  let items = this.items.map(function(ele) {return ele.name})
  let directions = Object.keys(this.directions)
  console.log(`The room has ${items.join(', ') || 'nothing in it'}.`)
  console.log(`There are entrances to the ${directions.join(', ')}`)
}

Room.prototype.getItem = function(itemName) {
  let item
  let items = this.items.filter(function(ele) {
    if (ele.name == itemName) {
      console.log(`you grab the ${ele.name}.`)  
      item = ele
      return false 
    }
    return true
  })
  this.items = items
  return item?item:false 
}


// Game initialization

function roomInit() {
  let axe = new Item('axe', 'This is just a normal axe. Useful for chopping wood or rats.', function(player){
    console.log('You hurt yourself')
    player.health -= 5 
    if (player.health <= 0) {
      console.log('You die')
      process.exit() 
    }
  })
  let flask = new Item('flask', 'This is a flask. Probably holds water or something.', function(player){
    console.log('You heal yourself')
    player.health += 5
  })
  let orb = new Item('orb', 'This orb glows with a magical energy.', function(player){
    console.log('You win!')
    process.exit()
  })

  let room1 = new Room('You are standing in standard dungeon room. There are lots of broken pots and stuff.', null, [axe, flask])
  let room2 = new Room('You are in another dungeon room. It\'s slightly more magical.', {north: room1}, [orb])
  room1.directions = {south: room2}

  return room1
}

function playerInit() {
  let playerName
  prompt.start()
  console.log('Hello adventurer! What is your name?')
  prompt.get(promptSchema, function(err, result) {
    console.log(`\nHello ${result.answer}!`)
    let name = result.answer

    console.log('Are you a paladin? y/n')
    prompt.get(promptSchema, function(err, result) {
      if (result.answer == 'n') {
        console.log('Great!')
        var player = new Player(name, roomInit())
      } else {
        console.log('This may be difficult') 
        var player = new ArmlessPlayer(name, roomInit())
      }
      player.location.look()
      options(player)
    })
  })
}

function options(player) {
  let commands = {
    help: function() {
      console.log('Possible commands are "use", "health", "move", "look", "take", "bagcheck", "die".')
      options(player)
    },
    health: function() {
      player.checkHealth()
      options(player) 
    },
    take: function() {
      prompt.start()
      console.log('What do you take?')
      prompt.get(promptSchema, function(err, result) {
        player.addItem(result.answer)
        options(player)
      })
    },
    look: function() {
      player.location.look() 
      options(player)
    },
    die: function() {
      player.health = 0
      console.log('You die')
      process.exit()
    },
    bagcheck: function() {
      player.checkInventory()
      options(player)
    },
    move: function() {
      prompt.start()
      console.log('Where do you go?')
      prompt.get(promptSchema, function(err, result) {
        player.move(result.answer)
        player.location.look()
        options(player)
      })
    },
    use: function() {
      prompt.start()
      console.log('What do you use?')
      prompt.get(promptSchema, function(err, result) {
        player.useItem(result.answer)
        options(player)
      })
    }
  }

  prompt.start()
  console.log('What do you do? (type "help" for help)')
  prompt.get(promptSchema, function(err, result) {
    try {
      commands[result.answer]()
    }
    catch(err) {
      console.log('I\'m sorry, I didn\'t understand that')
      options(player)
    }
  })
}


playerInit()
