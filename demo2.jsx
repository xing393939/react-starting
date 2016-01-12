function substitute(str, obj){
    return str.replace((/\\?\{([^{}]+)\}/g), function(match, name){
        if (match.charAt(0) === '\\') {
            return match.slice(1);
        }
        return (obj[name] === null || obj[name] === undefined) ? '' : obj[name];
    });
};
function classNames () {
    var classes = [];
    for (var i = 0; i < arguments.length; i++) {
        var arg = arguments[i];
        if (!arg) continue;

        var argType = typeof arg;

        if (argType === 'string' || argType === 'number') {
            classes.push(arg);
        } else if (Array.isArray(arg)) {
            classes.push(classNames.apply(null, arg));
        } else if (argType === 'object') {
            for (var key in arg) {
                if ({}.hasOwnProperty.call(arg, key) && arg[key]) {
                    classes.push(key);
                }
            }
        }
    }
    return classes.join(' ');
};
var TableHeader = React.createClass({
    getInitialState:function(){
        return {asc: 0}
    },
    //排序
    onSort:function(){
        var asc = this.state.asc === 0 ? 1 : 0;
        this.setState({ asc });
        this.props.onSort(this.props.name, asc);
    },
    render:function(){
        var sort = [],
            onSort = null,
            style = {};

        if (this.props.sortAble) {
            sort.push(<i key="up" className={classNames('arrow-up', {active: this.props.name === this.props.sort.name && this.state.asc === 1})} />);
            sort.push(<i key="down" className={classNames('arrow-down', {active: this.props.name === this.props.sort.name && this.state.asc === 0})} />);

            onSort = this.onSort;
            style = { cursor: 'pointer' };
        }

        return (
            <th style={style} onClick={onSort}>
                {this.props.header}
                {sort}
            </th>
        );
    }
});
var Table = React.createClass({
    unmounted:false,
    getInitialState:function(){
        return {
            index: this.props.pagination ? this.props.pagination.props.index : 1,
            data: [],
            sort: {},
            total: null
        }
    },
    componentWillMount:function(){
        this.fetchData(this.props.data);
    },
    componentDidMount:function(){
        this.setHeaderWidth();
    },
    componentWillReceiveProps:function(nextProps){
        if (nextProps.data !== this.props.data) {
            this.fetchData(nextProps.data);
        }
    },
    componentDidUpdate:function(){
        this.setHeaderWidth();
    },
    componentWillUnmount:function(){
        this.unmounted = true;
    },
    setHeaderWidth:function(){
        var body = this.refs.body;
        var tr = body.getElementsByTagName('tr')[0];
        if (!tr) {
            return;
        }

        var ths = this.refs.header.getElementsByTagName('th');

        var tds = tr.getElementsByTagName('td');
        for (var i = 0, count = tds.length; i < count; i++) {
            if (ths[i]) {
                ths[i].style.width = tds[i].offsetWidth + 'px';
            }
        }
    },
    fetchData:function(data){
        if (typeof data === 'function') {
            data.then((res) => {
                this.fetchData(res);
            })();
        } else {
            if (!this.unmounted) {
                this.setState({ data });
            }
        }
    },
    sortData:function(key, asc){
        var data = this.state.data;
        data = data.sort(function(a, b) {
            var x = a[key];
            var y = b[key];
            if (asc) {
                return ((x < y) ? -1 : ((x > y) ? 1 : 0));
            } else {
                return ((x > y) ? -1 : ((x < y) ? 1 : 0));
            }
        });
        this.setState({ data });
    },
    onCheck:function(i, e){
        var checked = typeof e === 'boolean' ? e : e.target.checked,
            data = this.state.data,
            index = this.state.index,
            psize = this.props.pagination.props.size,
            length = data.length,
            size = this.props.pagination ? (psize<length?psize:length) : data.length,
            start = 0,
            end = 0;
        if (i === 'all') {
            start = (index - 1) * size;
            end = index * size;
        } else {
            start = (index - 1) * size + i;
            end = start + 1;
        }
        for (; start < end; start++) {
            data[start].$checked = checked;
        }
        this.setState({data});
    },
    getChecked:function(){
        var values = [];
        this.state.data.forEach((d) => {
            if (d.$checked) {
                values.push(name ? d[name] : d);
            }
        });
        return values;
    },
    onBodyScroll:function(e){
        var hc = this.refs.headerContainer;
        hc.style.marginLeft = (0 - e.target.scrollLeft) + 'px';
    },
    getData:function(){
        var page = this.props.pagination,
            filters = this.props.filters,
            data = [];

        if (filters) {
            var filterCount = filters.length;
            this.state.data.forEach((d) => {
                var checked = true;
                for (var i = 0; i < filterCount; i++) {
                    var f = filters[i].func;
                    checked = f(d);
                    if (!checked) {
                        break;
                    }
                }
                if (checked) {
                    data.push(d);
                }
            });
        } else {
            data = this.state.data;
        }

        var total = data.length;

        if (!page) {
            return { total, data };
        }
        var size = page.props.size;
        if (data.length <= size) {
            return { total, data };
        }
        var index = this.state.index;
        data = data.slice((index - 1) * size, index * size);
        return { total:total, data:data};
    },
    renderBody:function(data){
        var me = this;
        var selectAble = me.props.selectAble;
        var trs = [];
        data.map(function(d, i){
            var tds = [];
            if (selectAble) {
                tds.push(
                    <td style={{width: 13}} key="checkbox">
                        <input checked={d.$checked} onChange={me.onCheck.bind(me, i)} type="checkbox" />
                    </td>
                );
            }
            me.props.headers.map(function(h, j){
                if (h.hidden) {
                    return;
                }
                var content = h.content,
                    tdStyle = {};
                if (typeof content === 'string') {
                    content = substitute(content, d);
                } else if (typeof content === 'function') {
                    content = content(d);
                } else {
                    content = d[h.name];
                }
                if (h.width) {
                    tdStyle.width = h.width;
                }
                tds.push(<td style={tdStyle} key={j}>{content}</td>);
            });
            trs.push(<tr key={i}>{tds}</tr>);
        });
        return <tbody>{trs}</tbody>;
    },
    renderHeader:function(){
        var headers = [];
        if (this.props.selectAble) {
            headers.push(
                <TableHeader key="checkbox" name="$checkbox" header={
                  <input onClick={this.onCheck.bind(this, 'all')} type="checkbox" />
                } />
            );
        }
        this.props.headers.map((header, i) => {
            if (header.hidden) {
                return;
            }

            var props = {
                key: i,
                onSort: (name, asc) => {
                    this.setState({sort: { name, asc }});
                    if (this.props.onSort) {
                        this.props.onSort(name, asc);
                    } else {
                        this.sortData(name, asc);
                    }
                },
                sort: this.state.sort
            };

            headers.push(
                <TableHeader {...header} {...props} />
            );
        });
        return <tr>{headers}</tr>;
    },
    renderPagination:function(total){
        if (!this.props.pagination) {
            return null;
        }
        var props = {
            total,
            onChange: (index) => {
                var data = this.state.data;
                data.forEach((d) => {
                    d.$checked = false;
                });
                this.setState({index, data});
            }
        };
        return  React.cloneElement(this.props.pagination, props);
    },
    render:function(){
        var bodyStyle = {},
            headerStyle = {},
            tableStyle = {},
            onBodyScroll = null,
            total = this.getData().total,
            data = this.getData().data;

        if (this.props.height) {
            bodyStyle.height = this.props.height;
            bodyStyle.overflow = 'auto';
        }
        if (this.props.width) {
            headerStyle.width = this.props.width;
            tableStyle.width = this.props.width;
            bodyStyle.width=this.props.width;
            bodyStyle.overflow = 'auto';
            onBodyScroll = this.onBodyScroll;
        }

        var className = classNames(
            this.props.className,
            'rct-table',
            {
                'rct-bordered': this.props.bordered,
                'rct-scrolled': this.props.height,
                'rct-striped': this.props.striped
            }
        );

        return (
            <div style={this.props.style} className={className}>
                <div className="header-container" style={headerStyle}>
                    <div ref="headerContainer">
                        <table ref="header">
                            <thead>{this.renderHeader()}</thead>
                        </table>
                    </div>
                </div>

                <div onScroll={onBodyScroll} style={bodyStyle} className="body-container">
                    <table style={tableStyle} className="rct-table-body" ref="body">
                        {this.renderBody(data)}
                    </table>
                </div>

                {this.renderPagination(total)}

            </div>
        );
    }
});

var data = [
    {
    name: '姓名01',
    position: 'name',
    office: '111111',
    start_date:'122321',
    salary:'22313'
}, {
    name: '姓名02',
    position: 'name',
    office: '222222',
    start_date:'122321',
    salary:'22313'
}, {
    name: '姓名03',
    position: 'name',
    office: '33333',
    start_date:'122321',
    salary:'22313'
}, {
    name: '姓名04',
    position: 'name',
    office: '444444',
    start_date:'122321',
    salary:'22313'
},
    {
        name: '姓名05',
        position: 'name',
        office: '5555555',
        start_date:'122321',
        salary:'22313'
    }, {
        name: '姓名06',
        position: 'name',
        office: '666666',
        start_date:'122321',
        salary:'22313'
    }, {
        name: '姓名07',
        position: 'name',
        office: '777777',
        start_date:'122321',
        salary:'22313'
    }, {
        name: '姓名08',
        position: 'name',
        office: '888888',
        start_date:'122321',
        salary:'22313'
    },{
        name: '姓名09',
        position: 'name',
        office: '9999999',
        start_date:'122321',
        salary:'22313'
    }, {
        name: '姓名10',
        position: 'name',
        office: '000000000',
        start_date:'122321',
        salary:'22313'
    }, {
        name: '姓名11',
        position: 'name',
        office: '112222',
        start_date:'122321',
        salary:'22313'
    }, {
        name: '姓名12',
        position: 'name',
        office: '1114444',
        start_date:'122321',
        salary:'22313'
    },{
        name: '姓名14',
        position: 'name',
        office: '33334444',
        start_date:'122321',
        salary:'22313'
    }, {
        name: '姓名13',
        position: 'name',
        office: '33336666',
        start_date:'122321',
        salary:'22313'
    }, {
        name: '姓名15',
        position: 'name',
        office: '66664444',
        start_date:'122321',
        salary:'22313'
    }, {
        name: '姓名16',
        position: 'name',
        office: '6666664444',
        start_date:'122321',
        salary:'22313'
    }
];
var headers =[
    { name: 'name', sortAble: true, header: 'Name' },
    { name: 'position', hidden: true },
    { name: 'office', sortAble: true, header: 'Office' },
    { name: 'start_date', sortAble: true, header: 'Start Date' },
    { name: 'salary', content: '{salary}', header: 'Salary' },
    { name: 'tools', content: "222" }
];

var changePage = function(){
    alert('1234')
}
var pagination = <Pagination index={1} size={10} pages={10} jumper={true} mini={false} onChange={changePage}/>;

var param = {
    data:data,
    pagination:pagination,
    headers:headers,
    striped:true,
    selectAble:true,
    bordered:true,
    width:800
}
ReactDOM.render(<Table {...param}/>,document.getElementById('table'));
