const w : number = window.innerWidth, h : number = window.innerHeight
const nodes : number = 5
const k = 4
class LinkedQuarterCircleStage {
    canvas : HTMLCanvasElement = document.createElement('canvas')
    context : CanvasRenderingContext2D
    animator : Animator = new Animator()
    lqc : LinkedQuarterCircle = new LinkedQuarterCircle()

    initCanvas() {
        this.canvas.width = w
        this.canvas.height = h
        this.context = this.canvas.getContext('2d')
        document.body.appendChild(this.canvas)
    }

    render() {
        this.context.fillStyle = '#212121'
        this.context.fillRect(0, 0, w, h)
        this.context.fillStyle = '#4527A0'
        this.lqc.draw(this.context)
    }

    handleTap() {
        this.canvas.onmousedown = () => {
            this.lqc.startUpdating(() => {
                this.animator.start(() => {
                    this.render()
                    this.lqc.update(() => {
                        this.animator.stop()
                        this.render()
                    })
                })
            })
        }
    }

    static init() {
        const stage : LinkedQuarterCircleStage = new LinkedQuarterCircleStage()
        stage.initCanvas()
        stage.render()
        stage.handleTap()
    }
}

class State {
    scale : number = 0
    dir : number = 0
    prevScale : number = 0

    update(cb : Function) {
        this.scale += (0.1 / k) * this.dir
        if (Math.abs(this.scale - this.prevScale) > 1) {
            this.scale = this.prevScale + this.dir
            this.dir = 0
            this.prevScale = this.scale
            cb(this.prevScale)
        }
    }

    startUpdating(cb : Function) {
        if (this.dir == 0) {
            this.dir = 1 - 2 * this.prevScale
            cb()
        }
    }
}

class Animator {
    animated : boolean = false
    interval : number

    start(cb : Function) {
        if (!this.animated) {
            this.animated = true
            this.interval = setInterval(cb, 50)
        }
    }

    stop() {
        if (this.animated) {
            this.animated = false
            clearInterval(this.interval)
        }
    }
}

class QCNode {
    prev : QCNode
    next : QCNode
    state : State = new State()

    constructor(private i : number) {
        this.addNeighbor()
    }

    addNeighbor() {
        if (this.i < nodes - 1) {
            this.next = new QCNode(this.i + 1)
            this.next.prev = this
        }
    }

    getNext(dir : number, cb : Function) : QCNode {
        var curr : QCNode = this.prev
        if (dir == 1) {
            curr = this.next
        }
        if (curr) {
            return curr
        }
        cb()
        return this
    }

    draw(context : CanvasRenderingContext2D) {
        const gap : number = h / (nodes + 1)
        const r : number = gap / 3
        const deg : number = (2 * Math.PI) / k
        const factor : number = 1 / k
        context.save()
        context.translate(w/2, gap * this.i + gap)
        for(var j = 0; j <  k ; j++) {
            const sc : number = Math.min(factor, Math.max(0, this.state.scale - factor * j)) * k
            context.save()
            context.rotate(deg * j)
            context.beginPath()
            context.moveTo(0, 0)
            for (var t = 0; t <= 90 * sc; t++) {
                const xa : number = r * Math.cos(t * Math.PI/180)
                const ya : number = r * Math.sin(t * Math.PI/180)
                context.lineTo(xa, ya)
                context.fill()
            }
            context.restore()
        }
        context.restore()
        if (this.prev) {
            this.prev.draw(context)
        }
    }

    update(cb : Function) {
        this.state.update(cb)
    }

    startUpdating(cb : Function) {
        this.state.startUpdating(cb)
    }
}

class LinkedQuarterCircle {
    curr : QCNode = new QCNode(0)
    dir : number = 1

    draw(ctx : CanvasRenderingContext2D) {
        this.curr.draw(ctx)
    }

    update(cb : Function) {
        this.curr.update(() => {
            this.curr = this.curr.getNext(this.dir, () => {
                this.dir *= -1
            })
            cb()
        })
    }

    startUpdating(cb : Function) {
        this.curr.startUpdating(cb)
    }
}
