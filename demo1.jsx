/**
 * 注释
 */
var mix1={
    f1:function(){
        console.log('f1');
    }
};
var mix2={
    f2:function(){
        console.log('f2');
    },
    f3:function(){
        console.log('f3');
    }
}

//注释
var MainBox = React.createClass({
    getInitialState: function () {
        return {
            conts:[
                '这是什么1xxx',
                '这是什么2',
                '这是什么3',
                '这是什么4',
                '这是什么5',
                '这是什么6',
                '这是什么7',
                '这是什么8',
                '这是什么9',
                '这是什么10'
            ],
            textVal:'cccccc'
        }
    },

    toChildren:function(data){
        console.log(data);
    },
    mixins:[mix1,mix2],
    render: function () {
        this.f1();
        this.f2();
        this.f3();
        var me = this;
        //setTimeout(function(){
        //    me.setState({
        //        textVal:'dddddd'
        //    })
        //},1000);
        var conts = this.state.conts;
        return <div>
                    <HeaderBox/>
                    <ContentBox toChildren={this.toChildren} textVal={this.state.textVal} conts={conts}/>
                        {this.props.textVal}
                    <FooterBox />
                </div>
    }
});

var HeaderBox = React.createClass({
    render: function () {
        return <h1 className="header" ref="header">我这头部</h1>
    },
    componentDidMount:function(){
        var h = this.refs.header;
        //console.log(h);
    }
});

var ContentBox = React.createClass({
    mixins:[React.addons.LinkedStateMixin],
    getInitialState:function(){
        return {
            value:''
        }
    },
    textChange:function(ev){
        var input = ev.target;
        this.props.toChildren({
            textVal:input.value
        });
    },
    render: function () {

        var cs = [];
        this.props.conts.forEach(function(key,index){
            cs.push(<li key={'xx_'+index}>哈哈说:<a >{key}</a></li>)
        });

        var form = <form>
                        <label htmlFor=""></label>
                        <input type="text" className="" valueLink={this.linkState('value')} /> <br/>

                        <input name="checkbox" type="checkbox"/> <br/>
                        <input name="checkbox" type="checkbox"/> <br/>

                        <label htmlFor="radio1">radio1</label>
                        <input id="radio1" name="radio" defaultChecked type="radio"/><br/>

                        <label htmlFor="radio2">radio2</label>
                        <input id="radio2" name="radio" type="radio"/><br/>

                        <select name="" id="">
                            <option value="1">111</option>
                            <option value="3">3333</option>
                            <option value="2">2222</option>
                            <option value="4">4444</option>
                        </select>
                        {this.props.value}
                    </form>

        return <div className="content">
                    <ul>{cs}</ul>
                    {form}
                    {this.state.value}
                </div>
    }
});

var FooterBox = React.createClass({
    render: function () {
        return <footer className="footer">这是尾部</footer>
    }
});

ReactDOM.render(<MainBox/>, document.getElementById('content'));