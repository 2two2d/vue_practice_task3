let eventBus = new Vue()

Vue.component('main-board', {
    template: `
        <div id="main">
            <p id="errorp">{{error}}</p>
            <div id="blocks_div">
                <div id="first_col" class="col">
                    <p class="col_title">Создание задач</p>
                    <point-card v-for="card in blockOneCards" :pointsAndTitle="card"></point-card>
                    <form>
                        <div id="upperFormDiv">
                            <div>
                                <p>Название карточки:</p>
                                <input type="text" placeholder="Название" v-model="cardTitle" maxlength="15">
                            </div>
                            <div>
                                <p>Задание:</p>
                                <textarea name="name" cols="20" rows="3" v-model="cardTask" placeholder="Задание" maxlength="60"></textarea>
                            </div>
                            <div>
                                <p>Дэдлайн:</p>
                                <input type="date" v-model="deadline">
                            </div>       
                        </div>
                        <input type="submit" @click.prevent="createCard" value="Создать карточку">
                    </form>
                </div>
                <div id="second_col" class="col">
                    <p class="col_title" style="font-size: 1.5em">Задачи в работе</p>
                    <point-card v-for="card in blockTwoCards" :pointsAndTitle="card"></point-card>
                </div>
                <div id="third_col" class="col">
                    <p class="col_title">Тестирование</p>
                    <point-card v-for="card in blockThreeCards" :pointsAndTitle="card"></point-card>
                </div>
                <div id="forth_col" class="col">
                    <p class="col_title">Выполненные задачи</p>
                    <point-card v-for="card in blockForthCards" :pointsAndTitle="card"></point-card>
                </div>
            </div>
        </div>
    `,
    data(){
        return{
            error: '',
            cardTitle: '',
            cardTask: '',
            blockOneCards: [],
            blockTwoCards: [],
            blockThreeCards: [],
            blockForthCards: [],
            renderComponent: true,
        }
    },
    methods: {
        createCard(){
            if(this.blockOneCards.length < 3){
                this.blockOneCards.push({title: this.cardTitle ? this.cardTitle : 'Без названия',
                                        task: this.cardTask ? this.cardTask : 'Задание',
                                        canHaveComment: false,
                                        comments: [],
                                        comment: '',
                                        deadline: this.deadline,
                                        deadlineJSDate: this.deadlineJSDate,
                                        createdAt: this.currentDate,
                                        updatedAt: null,
                                        toDelete: false,
                                        toChange: false,
                                        toMoveBack: false,
                                        toMoveForward: false,
                                        btnBack: false,
                                        btnForward: true,
                                        doneInTime: false,
                                        inForthColumn: false,
                                        inSecondColumn: false})

                this.error = ''
                let jsonData = JSON.stringify(this.allCardsByColumns)
                localStorage.setItem('jsonData', jsonData)

            }else{
                this.error = 'В первом столбце не может быть больше 3 карточек'
            }
        },
    },

    mounted(){
        eventBus.$on('cardDelete', ()=>{
            for(let i = 0; i < this.allCardsByColumns.length; i++){
                for(let j = 0; j < this.allCardsByColumns[i].length; j++){
                    if(this.allCardsByColumns[i][j].toDelete){
                        this.allCardsByColumns[i].splice(j, 1)
                    }
                }
            }
        })

        eventBus.$on('cardMoveForward',()=>{
            for(let i = 0; i < this.allCardsByColumns.length; i++){
                for(let j = 0; j < this.allCardsByColumns[i].length; j++){
                    if(this.allCardsByColumns[i][j].toMoveForward){
                        if(i==0){
                            this.allCardsByColumns[i][j].toMoveForward = false
                            this.blockTwoCards.push(this.allCardsByColumns[i][j])
                            this.allCardsByColumns[i].splice(j, 1)
                        }else if(i==1){
                            this.allCardsByColumns[i][j].btnBack = true
                            this.allCardsByColumns[i][j].canHaveComment = true
                            this.allCardsByColumns[i][j].inSecondColumn = false
                            this.allCardsByColumns[i][j].toMoveForward = false
                            this.blockThreeCards.push(this.allCardsByColumns[i][j])
                            this.allCardsByColumns[i].splice(j, 1)
                        }else if(i==2){
                            if(this.allCardsByColumns[i][j].comment){
                                this.allCardsByColumns[i][j].canHaveComment = true
                            }else{
                                this.allCardsByColumns[i][j].canHaveComment = false
                            }
                            if(this.allCardsByColumns[i][j].deadlineJSDate > new Date()){
                                this.allCardsByColumns[i][j].doneInTime = true
                                this.allCardsByColumns[i][j].inForthColumn = true
                            }else{
                                this.allCardsByColumns[i][j].doneInTime = false
                                this.allCardsByColumns[i][j].inForthColumn = true
                            }

                            this.allCardsByColumns[i][j].toMoveForward = false
                            this.allCardsByColumns[i][j].btnBack = false
                            this.allCardsByColumns[i][j].btnForward = false
                            this.blockForthCards.push(this.allCardsByColumns[i][j])
                            this.allCardsByColumns[i].splice(j, 1)
                        }
                    }
                }
            }
        })

        eventBus.$on('cardMoveBack',()=>{
            for(let i = 0; i < this.allCardsByColumns.length; i++){
                for(let j = 0; j < this.allCardsByColumns[i].length; j++){
                    if(this.allCardsByColumns[i][j].toMoveBack){
                        this.allCardsByColumns[i][j].comments.push(this.allCardsByColumns[i][j].comment)
                        this.allCardsByColumns[i][j].comment = ''
                        this.allCardsByColumns[i][j].inSecondColumn = true
                        this.allCardsByColumns[i][j].btnBack = false
                        this.allCardsByColumns[i][j].toMoveForward = true
                        this.blockTwoCards.push(this.allCardsByColumns[i][j])
                        this.allCardsByColumns[i].splice(j, 1)
                    }
                }
            }
        })
    },
    computed: {
        allCardsByColumns() {
            return [this.blockOneCards, this.blockTwoCards, this.blockThreeCards, this.blockForthCards]
        },
        deadline(){
            return new Date(new Date().getTime() + 24 * 60 * 60 * 1000 * 7).toISOString().substring(0,10)
        },
        deadlineJSDate(){
            return new Date(new Date().getTime() + 24 * 60 * 60 * 1000 * 7)
        },
        currentDate() {
            return new Date().toISOString().substring(0,10)
        }
    }
})

Vue.component('point-card', {
    template: `
        <div id="card">
            <div v-if="pointsAndTitle.toChange===false" class="cardside" v-bind:class="{'doneInTime': (pointsAndTitle.inForthColumn && pointsAndTitle.doneInTime), notDoneInTime:(!pointsAndTitle.doneInTime && pointsAndTitle.inForthColumn)}">
                <button v-if="pointsAndTitle.btnBack" @click="pointsAndTitle.toMoveBack=true; moveBack()" class="moveBackBtn"><</button>
                <button v-if="pointsAndTitle.btnForward" @click="pointsAndTitle.toMoveForward=true; moveForward()" class="moveForwardBtn">></button>
                <p id="cardTitle">{{pointsAndTitle.title}}</p>
                <hr>
                <p>{{pointsAndTitle.task}}</p>
                <hr>
                <p class="cardDate">Создано: {{pointsAndTitle.createdAt}}</p>
                <p class="cardDate">Дэдлайн: {{pointsAndTitle.deadline}}</p>
                <p v-if="pointsAndTitle.updatedAt" class="cardDate">Обновлён: {{pointsAndTitle.updatedAt}}</p>
                <div class="cardBtnsDiv">
                    <button v-if="!pointsAndTitle.inForthColumn" class="just_button" @click="pointsAndTitle.toChange=true">Изменить</button>
                    <button class="danger_button" @click="pointsAndTitle.toDelete=true; cardDelete()">Удалить</button>
                </div>
                <div class="returnSection" v-if="pointsAndTitle.canHaveComment">
                    <p v-for="comment in pointsAndTitle.comments">{{comment}}</p>
                    <textarea type="text" placeholder="Комментарий" v-model="pointsAndTitle.comment" v-if="!pointsAndTitle.inSecondColumn"></textarea>
                </div>
            </div>
            <div v-else class="cardside">
                <p>Название: <input type="text" v-model="reserveTitle"></p>
                <p>Задание: <input type="text" v-model="reserveTask"></p>
                <p>Дэдлайн: <input type="date" v-model="reserveDeadLine"></p>
                <div class="cardBtnsDiv">
                    <button class="just_button" @click="pointsAndTitle.toChange=false">Отмена</button>
                    <button class="just_button" @click="cardUpdate();setUpdateMark();pointsAndTitle.toChange=false">Изменить</button>
                </div>
            </div>
        </div>
    `,
    props:{
        pointsAndTitle: null
    },
    methods: {
        cardDelete(){
            eventBus.$emit('cardDelete')
        },
        cardUpdate(){
            this.pointsAndTitle.title = this.reserveTitle
            this.pointsAndTitle.task = this.reserveTask
            this.pointsAndTitle.deadline = this.reserveDeadLine
        },
        setUpdateMark(){
            this.pointsAndTitle.updatedAt = new Date().toISOString().substring(0,10) + ' ' +  new Date().toISOString().substring(11,19)
        },
        moveForward(){
            eventBus.$emit('cardMoveForward')
        },
        moveBack(){
            eventBus.$emit('cardMoveBack')
        }
    },
    data() {
        return{
            reserveTitle: JSON.parse(JSON.stringify(this.pointsAndTitle.title)),
            reserveTask: JSON.parse(JSON.stringify(this.pointsAndTitle.task)),
            reserveDeadLine: JSON.parse(JSON.stringify(this.pointsAndTitle.deadline))
        };
    }
})
let app = new Vue({
    el: '#app',
})