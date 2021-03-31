import {IntervalTimer} from '../../utils/timers/intervalTimer.js'

export class GameStageOptions {
	constructor({rows, columns, enemies, bombCount, explosionSize, roundTime, score, powerUps, map}) {
		this.rows = rows
		this.columns = columns
		this.enemies = enemies
		this.bombCount = bombCount
		this.explosionSize = explosionSize
		this.roundTime = roundTime
		this.passedTime = 0
		this.score = score
		this.initialScore = score
		this.powerUps = powerUps
		this.deathCount = 0
		if (map)
			this.map = map
		this.areEnemiesDead = false

		this.initialize()
	}

	initialize = () => {
		this.initializeTimer()
		this.initializeScore()
	}

	draw = () => {
		this.drawTimer()
		this.drawScore()
	}

	drawScore = () => {
		this.scoreDiv.querySelector('span').innerText = `${this.score}`
	}

	drawTimer = () => {
		this.timerDiv.querySelector('span').innerText = `${this.roundTime}`
	}

	initializeTimer = () => {
		const timerDiv = document.querySelector('#timer')
		timerDiv && timerDiv.remove()
		this.timerDiv = document.createElement('div')
		this.timerDiv.id = 'timer'
		const img = document.createElement('img')
		img.src = './img/game-info/clock.png'
		img.alt = 'clock'
		const span = document.createElement('span')
		span.innerText = `${this.roundTime}`
		this.timerDiv.append(img)
		this.timerDiv.append(span)
		document.querySelector('#game-info').append(this.timerDiv)
	}

	initializeScore = () => {
		const score = document.querySelector('#score')
		score && score.remove()
		this.scoreDiv = document.createElement('div')
		this.scoreDiv.id = 'score'
		const img = document.createElement('img')
		img.src = './img/game-info/star.png'
		img.alt = 'star'
		const span = document.createElement('span')
		span.innerText = `${this.score}`
		this.scoreDiv.append(img)
		this.scoreDiv.append(span)
		document.querySelector('#game-info').append(this.scoreDiv)
	}

	initializeTimerChange = () => {
		this.resetRoundTime()
		this.interval && this.interval.clear()
		this.interval = new IntervalTimer(() => {
			this.roundTime--
			this.passedTime++
			if (this.roundTime <= 0)
				this.interval.clear()
		})
	}

	resetRoundTime = () => {
		this.roundTime += this.passedTime
		this.passedTime = 0
	}
	
	reset = settings => {
		this.score = 0
		this.bombCount = settings.bombCount
		this.explosionSize = settings.explosionSize
	}
}