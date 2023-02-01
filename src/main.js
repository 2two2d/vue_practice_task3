Vue.component('main-board', {
    template: `
        <div id="main">
            <p id="errorp">{{error}}</p>
            <div id="blocks_div">
                <div id="first_col" class="col">
                    <point-card v-for="card in blockOneCards" :pointsAndTitle="card"></point-card>
                    <form>
                        <div id="upperFormDiv">
                            <div>
                                <p>Название карточки:</p>
                                <input type="text" placeholder="Название" v-model="cardTitle" maxlength="15">
                            </div>
                            <p>Количество заметок в карточке:</p>
                            <input type="number" max="5" min="3" v-model="numberOfOptions">
                            
                            
                            <input type="submit" value="Создать пункты" @click.prevent="makeOptionsArr" maxlength="20">
                        </div>
                        <input v-for="i in options" :key="i" class="pointInput" type="text" placeholder="пункт">
                        <input type="submit" @click.prevent="createCard" value="Создать карточку">
                    </form>
                </div>
                <div id="second_col" class="col">
                    
                </div>
                <div id="third_col" class="col">
                    
                </div>
            </div>
        </div>
    `,
    data(){
        return{
            error: '',
            numberOfOptions: 5,
            cardTitle: '',
            options: [],
            points: [],
            blockOneCards: [],
            blockTwoCards: [],
            blockThreeCards: [],
            renderComponent: true,
        }
    },
    methods: {
        makeOptionsArr(){
            this.points.splice(0,this.points.length)
            this.options.splice(0,this.options.length);

            for(let i = 0; i < this.numberOfOptions; i++){
                this.options.push(i)
            }
        },
        createCard(){
            if(this.blockOneCards.length < 3){
                this.options.splice(0,this.options.length)
                this.points.splice(0,this.points.length)
                let points = document.querySelectorAll('.pointInput')

                for(let i = 0; i < points.length; i++){
                    this.points.push({point: points[i].value ? points[i].value:'Задание ' +(i+1), checked: false})
                }

                let copy = this.points.concat()

                this.blockOneCards.push({title: this.cardTitle ? this.cardTitle : 'Без названия', points: copy})

                this.error = ''
            }else{
                this.error = 'В первом столбце не может быть больше 3 карточек'
            }


        }
    }
})

Vue.component('point-card', {
    template: `
        <div id="card">
            <p id="cardTitle">{{pointsAndTitle.title}}</p>
            <ul id="pointslist">
                <div v-for="point in pointsAndTitle.points" @click="point.checked=true" :class="{checked:TaskDone}">
                    <li>{{point.point}}</li>
                    <hr>
                </div>
            </ul>
        </div>
    `,
    props:{
        pointsAndTitle: null
    }
})


let app = new Vue({
    el: '#app',
})