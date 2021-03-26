import {ENEMY_XP_SHOW_TIME, PIXEL_SIZE} from '../../../utils/constants.js'
import {Timer} from '../../../utils/timers/timer.js'

export class EnemyXP {
	constructor({board, left, top, amount}) {
		this.board = board
		this.left = left
		this.top = top
		this.amount = amount

		this.initialize()
	}

	initialize() {
		this.createHTML()
		this.deleteAfter()
	}

	createHTML() {
		this.div = document.createElement('div')
		this.div.className = 'enemy-xp'
		this.div.innerText = this.amount
		this.div.style.transform = `translate3d(${this.left}px, ${this.top + (3 * PIXEL_SIZE)}px, 0)`
		this.board.append(this.div)
	}

	deleteAfter = () => {
		new Timer(() => {
			this.div.remove()
		}, ENEMY_XP_SHOW_TIME)
	}
}