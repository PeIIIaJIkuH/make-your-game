const getRandomInt = (min, max) => {
	min = Math.ceil(min)
	max = Math.ceil(max)
	return Math.floor(Math.random() * (max - min)) + min
}

const getRandomDirection = (directions = ['left', 'right', 'up', 'down']) => {
	return directions[getRandomInt(0, directions.length)]
}

class Entity {
	constructor({board, pixelSize = 1, left, top, speed}) {
		this.board = board
		this.pixelSize = pixelSize
		this.speed = speed || pixelSize / 3
		this.left = left || pixelSize * 2
		this.top = top || pixelSize * 2
		this.size = 16 * pixelSize * 0.75

		this.initialize()
		this.draw()
	}

	createHTML = () => {
		this.div = document.createElement('div')
		this.div.style.position = 'absolute'
		this.img = document.createElement('img')
		this.div.append(this.img)
		this.board.append(this.div)
	}

	moveLeft() {
		this.left -= this.speed
	}

	moveRight() {
		this.left += this.speed
	}

	moveUp() {
		this.top -= this.speed
	}

	moveDown() {
		this.top += this.speed
	}

	draw = () => {
		this.div.style.position = 'absolute'
		this.div.style.left = `${16 * this.pixelSize + this.left}px`
		this.div.style.top = `${16 * this.pixelSize + this.top}px`
		this.div.style.height = `${this.size}px`
		this.div.style.width = `${this.size}px`

	}

	initialize = () => {
		this.createHTML()
	}
}

class Enemy extends Entity {
	constructor({board, pixelSize = 1, left, top}) {
		super({board, pixelSize, left, top})
		this.speed /= 2
		this.direction = getRandomDirection()
		this.dead = false

		this.initialize()
	}

	createHTML = () => {
		this.div.className = 'enemy'
		this.img.src = './img/enemy.png'
	}

	moveLeft() {
		super.moveLeft()
		this.img.className = 'enemy-walk-left'
		this.direction = 'left'
	}

	moveRight() {
		super.moveRight()
		this.img.className = 'enemy-walk-right'
		this.direction = 'right'
	}

	moveUp() {
		super.moveUp()
		this.img.className = 'enemy-walk-up'
		this.direction = 'up'
	}

	moveDown() {
		super.moveDown()
		this.img.className = 'enemy-walk-down'
		this.direction = 'down'
	}

	die() {
		this.img.className = 'enemy-die'
		this.dead = true
		setTimeout(() => {
			this.img.className = 'enemy-dead'
			this.div.remove()
		}, 700)
	}

	initialize = () => {
		this.createHTML()
	}
}

class Block {
	constructor({board, x, y}) {
		this.board = board
		this.x = x
		this.y = y

		this.initialize()
	}

	createHTML = () => {
		this.div = document.createElement('div')
		this.div.style.gridColumnStart = String(this.x)
		this.div.style.gridRowStart = String(this.y)
		this.board.append(this.div)
	}

	initialize = () => {
		this.createHTML()
	}
}

class Rock extends Block {
	constructor({board, x, y}) {
		super({board, x, y})
		this.initialize()
	}

	initialize = () => {
		this.createHTML()
	}

	createHTML = () => {
		this.div.classList.add('rock')
	}
}

class Wall extends Block {
	constructor({board, x, y}) {
		super({board, x, y})
		this.initialize()
	}

	initialize = () => {
		this.createHTML()
	}

	createHTML = () => {
		this.div.classList.add('wall')
		this.img = document.createElement('img')
		this.img.src = './img/wall.png'
		this.div.append(this.img)
	}

	explode() {
		this.img.classList.add('wall-explode')
	}
}

class Bomb {
	constructor({board, x, y, size, game}) {
		this.board = board
		this.x = x
		this.y = y
		this.size = size
		this.game = game

		this.initialize()
	}

	createHTML = () => {
		this.div = document.createElement('div')
		this.img = document.createElement('img')
		this.div.classList.add('bomb')
		this.div.style.gridColumnStart = String(this.x)
		this.div.style.gridRowStart = String(this.y)
		this.img.src = './img/bomb.png'
		this.div.append(this.img)
		this.board.append(this.div)
	}

	initialize = () => {
		this.createHTML()
	}

	explode = () => {
		this.explosion = new Explosion({board: this.board, x: this.x, y: this.y, size: this.size, game: this.game})
	}
}

class Explosion {
	constructor({board, x, y, size, game}) {
		this.board = board
		this.x = x
		this.y = y
		this.size = size
		this.game = game
		this.arr = []

		this.initialize()
	}

	create = (x, y, className) => {
		let created = true,
			data
		if (!this.game.isBlock(x, y, true)) {
			const div = document.createElement('div')
			const img = document.createElement('img')
			div.classList.add('explosion')
			img.classList.add(className)
			img.src = './img/explosion.png'
			div.style.gridColumnStart = String(x)
			div.style.gridRowStart = String(y)
			div.append(img)
			this.board.append(div)
			setTimeout(() => {
				this.game.explosions = this.game.explosions.filter(explosion => {
					return !(explosion.style.gridRowStart === div.style.gridRowStart && explosion.style.gridColumnStart === div.style.gridColumnStart)
				})
				div.remove()
			}, 500)
			created = true
			data = div
			this.game.explosions.push(data)
		} else if (this.game.isWall(x, y)) {
			const wall = this.game.getWall(x, y)
			wall.explode()
			setTimeout(() => {
				this.game.deleteWall(x, y)
			}, 500)
			created = false
		} else if (this.game.isRock(x, y)) {
			created = false
		}
		return {created, data}
	}

	createCenter = () => {
		const {data} = this.create(this.x, this.y, 'explosion-center')
		this.arr.push(data)
	}
	createLeft = () => {
		const {data} = this.create(this.x - this.size, this.y, 'explosion-left')
		this.arr.push(data)
	}
	createRight = () => {
		const {data} = this.create(this.x + this.size, this.y, 'explosion-right')
		this.arr.push(data)
	}
	createTop = () => {
		const {data} = this.create(this.x, this.y - this.size, 'explosion-top')
		this.arr.push(data)
	}
	createBottom = () => {
		const {data} = this.create(this.x, this.y + this.size, 'explosion-bottom')
		this.arr.push(data)
	}
	createLeftHorizontals = () => {
		for (let i = this.x - 1; i >= this.x - this.size + 1; i--) {
			const {created, data} = this.create(i, this.y, 'explosion-horizontal')
			if (created)
				this.arr.push(data)
			else
				return false
		}
		return true
	}
	createRightHorizontals = () => {
		for (let i = this.x + 1; i < this.x + this.size; i++) {
			const {created, data} = this.create(i, this.y, 'explosion-horizontal')
			if (created)
				this.arr.push(data)
			else
				return false
		}
		return true
	}
	createTopVerticals = () => {
		for (let i = this.y - 1; i >= this.y - this.size + 1; i--) {
			const {created, data} = this.create(this.x, i, 'explosion-vertical')
			if (created)
				this.arr.push(data)
			else
				return false
		}
		return true
	}
	createBottomVerticals = () => {
		for (let i = this.y + 1; i < this.y + this.size; i++) {
			const {created, data} = this.create(this.x, i, 'explosion-vertical')
			if (created)
				this.arr.push(data)
			else
				return false
		}
		return true
	}

	createHTML = () => {
		this.createCenter()
		if (this.createLeftHorizontals())
			this.createLeft()
		if (this.createRightHorizontals())
			this.createRight()
		if (this.createTopVerticals())
			this.createTop()
		if (this.createBottomVerticals())
			this.createBottom()
	}

	initialize = () => {
		this.createHTML()
	}
}

class Bomberman extends Entity {
	constructor({board, pixelSize = 1, bombCount = 1}) {
		super({board, pixelSize})
		this.direction = 'down'
		this.bombCount = bombCount
		this.bombs = []
		this.bombing = false

		this.initialize()
	}

	createHTML = () => {
		this.div.id = 'bomberman'
		this.img.src = './img/bomberman.png'
	}

	moveLeft() {
		super.moveLeft()
		this.img.className = 'bomberman-walk-left'
		this.direction = 'left'
	}

	moveRight() {
		super.moveRight()
		this.img.className = 'bomberman-walk-right'
		this.direction = 'right'
	}

	moveUp() {
		super.moveUp()
		this.img.className = 'bomberman-walk-up'
		this.direction = 'up'
	}

	moveDown() {
		super.moveDown()
		this.img.className = 'bomberman-walk-down'
		this.direction = 'down'
	}

	die() {
		this.img.className = 'bomberman-die'
		setTimeout(() => {
			this.img.className = 'bomberman-dead'
		}, 700)
	}

	initialize = () => {
		this.createHTML()
	}
}

class Game {
	constructor({
					rows = 13, columns = 31, pixelSize = 1, enemyCount = 5,
					explodeTime = 2000, explosionSize = 1, bombCount = 1
				} = {}) {
		this.rows = rows
		this.columns = columns
		this.pixelSize = pixelSize
		this.keysPressed = {}
		this.board = document.querySelector('#board')
		this.size = 16 * this.pixelSize
		this.enemyCount = enemyCount
		this.rocks = []
		this.walls = []
		this.bomberman = new Bomberman({board: this.board, pixelSize: this.pixelSize, bombCount})
		this.enemies = []
		this.over = false
		this.explodeTime = explodeTime
		this.explosionSize = explosionSize
		this.explosions = []

		this.initialize()
	}

	initialize = () => {
		this.createHTML()
		this.createCSS()
		this.addEventListeners()

		this.animate()
	}

	createRocks = () => {
		for (let i = 1; i <= this.columns; i++) {
			this.rocks.push(new Rock({x: i, y: 1, board: this.board}))
			this.rocks.push(new Rock({x: i, y: this.rows, board: this.board}))
		}
		for (let i = 2; i < this.rows; i++) {
			this.rocks.push(new Rock({x: 1, y: i, board: this.board}))
			this.rocks.push(new Rock({x: this.columns, y: i, board: this.board}))
		}
		for (let i = 3; i < this.columns; i += 2)
			for (let j = 3; j < this.rows; j += 2)
				this.rocks.push(new Rock({x: i, y: j, board: this.board}))
	}

	getWall = (x, y) => {
		return this.walls.filter(wall => wall.x === x && wall.y === y)[0]
	}

	deleteWall = (x, y) => {
		this.walls = this.walls.filter(wall => {
			if (wall.x === x && wall.y === y) {
				wall.div.remove()
				return false
			}
			return true
		})
	}

	isWall = (x, y) => {
		return this.walls.some(wall => wall.x === x && wall.y === y)
	}

	isRock = (x, y) => {
		return this.rocks.some(rock => rock.x === x && rock.y === y)
	}

	isBlock = (x, y, withoutBombs = false) => {
		x = Math.floor(x)
		y = Math.floor(y)
		return x < 1 || y < 1 || x > this.columns || y > this.rows || this.isRock(x, y) || this.isWall(x, y) ||
			(!withoutBombs && this.bomberman.bombs.some(bomb => bomb.x === x && bomb.y === y))
	}

	isExplosion = (x, y) => {
		x = Math.floor(x)
		y = Math.floor(y)
		return this.explosions.some(explosion => parseInt(explosion.style.gridColumnStart) === x && parseInt(explosion.style.gridRowStart) === y)
	}

	createWalls = () => {
		const count = Math.round(this.rows * this.columns / 8)
		const wallsCount = getRandomInt(count * 0.9, count * 1.1)
		let sum = 0
		while (sum < wallsCount) {
			const x = getRandomInt(1, this.columns),
				y = getRandomInt(1, this.rows)
			if (!this.isBlock(x, y) && !(x <= 3 && y <= 3)) {
				this.walls.push(new Wall({x, y, board: this.board}))
				sum++
			}
		}
	}

	createEnemies = () => {
		let sum = 0
		while (sum < this.enemyCount) {
			const x = getRandomInt(1, this.columns),
				y = getRandomInt(1, this.rows)
			if (!this.isBlock(x, y) && !(x <= 5 && y <= 5)) {
				const left = this.size * (x - 2) + (2 * this.pixelSize),
					top = this.size * (y - 2) + (2 * this.pixelSize)
				this.enemies.push(new Enemy({left, top, board: this.board, pixelSize: this.pixelSize}))
				sum++
			}
		}
	}

	createHTML = () => {
		this.createRocks()
		this.createWalls()
		this.createEnemies()
	}

	createCSS = () => {
		const style = document.createElement('style')
		style.innerHTML = `
			#board {
				grid-template-rows: repeat(${this.rows}, ${this.size}px);
				grid-template-columns: repeat(${this.columns}, ${this.size}px);
			}`
		document.querySelector('head').append(style)
		this.updateSizes()
	}

	updateSizes = () => {
		this.board.style.width = `${this.size * this.columns}px`
		this.board.style.height = `${this.size * this.rows}px`
	}

	addEventListeners = () => {
		document.addEventListener('keydown', e => {
			this.keysPressed[e.code] = true
		})
		document.addEventListener('keyup', e => {
			this.keysPressed[e.code] = false
		})
	}

	checkCollisionWithEnemies() {
		const left = this.bomberman.left,
			right = this.bomberman.left + this.bomberman.size,
			top = this.bomberman.top,
			bottom = this.bomberman.top + this.bomberman.size
		for (let enemy of this.enemies) {
			const eLeft = enemy.left,
				eRight = enemy.left + enemy.size,
				eTop = enemy.top,
				eBottom = enemy.top + enemy.size
			if (!(top > eBottom || right < eLeft || left > eRight || bottom < eTop))
				return true
		}
	}

	checkBombermanExplode() {
		const left = this.bomberman.left / this.size + 2,
			right = (this.bomberman.left + this.bomberman.size) / this.size + 2,
			top = this.bomberman.top / this.size + 2,
			bottom = (this.bomberman.top + this.bomberman.size) / this.size + 2
		return this.isExplosion(left, top) || this.isExplosion(left, bottom) || this.isExplosion(right, top) || this.isExplosion(right, bottom)

	}

	updateBomberman = () => {
		if (this.checkCollisionWithEnemies()) {
			this.over = true
			this.bomberman.die()
			return
		}

		if (this.checkBombermanExplode()) {
			this.over = true
			this.bomberman.die()
			return
		}

		const left = (this.bomberman.left - 1) / this.size + 2,
			right = (this.bomberman.left + this.bomberman.size) / this.size + 2,
			top = (this.bomberman.top - 1) / this.size + 2,
			bottom = (this.bomberman.top + this.bomberman.size) / this.size + 2
		let moved = false
		if (this.keysPressed['KeyA'] && !this.keysPressed['KeyD'])
			if (!this.isBlock(left, top + 0.05, true) && !this.isBlock(left, bottom - 0.05, true)) {
				this.bomberman.moveLeft()
				moved = true
			}
		if (this.keysPressed['KeyD'] && !this.keysPressed['KeyA'])
			if (!this.isBlock(right, top + 0.05, true) && !this.isBlock(right, bottom - 0.05, true)) {
				this.bomberman.moveRight()
				moved = true
			}
		if (this.keysPressed['KeyW'] && !this.keysPressed['KeyS'])
			if (!this.isBlock(left + 0.05, top, true) && !this.isBlock(right - 0.05, top, true)) {
				this.bomberman.moveUp()
				moved = true
			}
		if (this.keysPressed['KeyS'] && !this.keysPressed['KeyW'])
			if (!this.isBlock(left + 0.05, bottom, true) && !this.isBlock(right - 0.05, bottom, true)) {
				this.bomberman.moveDown()
				moved = true
			}
		if (!moved)
			this.bomberman.img.className = `bomberman-look-${this.bomberman.direction}`
	}

	checkEnemyExplode(enemy) {
		const left = enemy.left / this.size + 2,
			right = (enemy.left + enemy.size - 1) / this.size + 2,
			top = enemy.top / this.size + 2,
			bottom = (enemy.top + enemy.size - 1) / this.size + 2
		if (this.isExplosion(left, top) || this.isExplosion(left, bottom) || this.isExplosion(right, top) || this.isExplosion(right, bottom)) {
			this.enemies = this.enemies.filter(e => e !== enemy)
			enemy.die()
		}
	}

	updateEnemy = enemy => {
		this.checkEnemyExplode(enemy)

		if (!enemy.dead) {
			const left = (enemy.left - 1) / this.size + 2,
				right = (enemy.left + enemy.size) / this.size + 2,
				top = (enemy.top - 1) / this.size + 2,
				bottom = (enemy.top + enemy.size) / this.size + 2
			if (enemy.direction === 'left') {
				if (!this.isBlock(left, top + 0.05) && !this.isBlock(left, bottom - 0.05))
					enemy.moveLeft()
				else
					enemy.direction = getRandomDirection(['right', 'up', 'down'])
				return
			}
			if (enemy.direction === 'right') {
				if (!this.isBlock(right, top + 0.05) && !this.isBlock(right, bottom - 0.05))
					enemy.moveRight()
				else
					enemy.direction = getRandomDirection(['left', 'up', 'down'])
				return
			}
			if (enemy.direction === 'up') {
				if (!this.isBlock(left + 0.05, top) && !this.isBlock(right - 0.05, top))
					enemy.moveUp()
				else
					enemy.direction = getRandomDirection(['left', 'right', 'down'])
				return
			}
			if (enemy.direction === 'down') {
				if (!this.isBlock(left + 0.05, bottom) && !this.isBlock(right - 0.05, bottom))
					enemy.moveDown()
				else
					enemy.direction = getRandomDirection(['left', 'right', 'up'])
			}
		}
	}

	updateBomb = () => {
		if (this.keysPressed['Space'] && this.bomberman.bombCount && !this.bomberman.bombing) {
			const x = Math.floor((this.bomberman.left - 1 + (this.size / 2)) / this.size + 2),
				y = Math.floor((this.bomberman.top - 1 + (this.size / 2)) / this.size + 2)
			this.bomberman.bombs.push(new Bomb({board: this.board, x, y, size: this.explosionSize, game: this}))
			this.bomberman.bombCount--
			this.bomberman.bombing = true
			setTimeout(() => {
				this.bomberman.bombCount++
				this.bomberman.bombs = this.bomberman.bombs.filter(bomb => {
					if (bomb.x === x && bomb.y === y) {
						bomb.div.remove()
						bomb.explode()
						return false
					}
					return true
				})
			}, this.explodeTime)
			setTimeout(() => {
				this.bomberman.bombing = false
			}, 400)
		}
	}

	update = () => {
		this.updateBomb()
		this.updateBomberman()
		this.enemies.forEach(enemy => {
			this.updateEnemy(enemy)
		})
	}

	draw = () => {
		this.bomberman.draw()
		this.enemies.forEach(enemy => {
			enemy.draw()
		})
	}

	animate = () => {
		const callback = () => {
			if (!this.over) {
				requestAnimationFrame(callback)

				this.update()
				this.draw()
			}
		}
		requestAnimationFrame(callback)
	}
}

new Game({
	pixelSize: 3,
	bombSize: 1
})