/**
 * Created by xiaojianli@pptv.com on 2016/1/5.
 */
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
function forEach (obj, fn, context) {
    Object.keys(obj).forEach((key) => fn.call(context, obj[key], key));
};
var Pagination = React.createClass({
    getInitialState:function(){
        return {
            index: this.props.index
        }
    },
    componentWillReceiveProps:function(nextProps) {
        if (nextProps.index !== this.props.index) {
            this.setState({ index: nextProps.index });
        }
    },
    getIndex:function() {
        return this.state.index;
    },
    setIndex:function(index) {
        index = parseInt(index);
        this.setState({index});
    },
    setInput:function (event) {
        event.preventDefault();

        var value = this.refs.input.value;
        value = parseInt(value);
        if (isNaN(value)) {
            return;
        }
        if (value < 1) {
            this.handleChange(1);
            return;
        }

        this.setIndex(value);
        if (this.props.onChange) {
            this.props.onChange(value);
        }
    },
    handleChange:function (index) {
        this.setIndex(index);
        if (this.refs.input) {
            this.refs.input.value = index;
        }
        if (this.props.onChange) {
            this.props.onChange(index);
        }
    },
    getPages:function () {
        var total = this.props.total,
            size = this.props.size,
            index = this.state.index,
            span = this.props.pages,
            max = Math.ceil(total / size),
            pages = [],
            left,
            right;

        if (index > max) {
            index = max;
        }

        left = index - Math.floor(span / 2) + 1;
        if (left < 1) {
            left = 1;
        }
        right = left + span - 2;
        if (right >= max) {
            right = max;
            left = right - span + 2;
            if (left < 1) {
                left = 1;
            }
        } else {
            right -= left > 1 ? 1 : 0;
        }

        // add first
        if (left > 1) {
            pages.push(1);
        }
        for (var i = left; i < right + 1; i++) {
            pages.push(i);
        }
        // add last
        if (right < max) {
            pages.push(max);
        }

        return {pages, max};
    },
    render:function() {
        var index = this.state.index,
            {mini} = this.props,
            {pages, max} = this.getPages(),
            items = [];

        // Previous
        items.push(
            <li key="previous" onClick={index <= 1 ? null : this.handleChange.bind(this,index - 1)} className={classNames({ disabled: index <= 1 })}>
                <a>&laquo;</a>
            </li>
        );

        if (mini) {
            items.push(
                <form key="i" onSubmit={this.setInput.bind(this)}>
                    <input ref="input" defaultValue={this.state.index} type="text" className="rct-form-control" />
                </form>
            );
            items.push(<span key="s"> / {max}</span>);
        } else {
            forEach(pages, function (i) {
                items.push(
                    <li onClick={this.handleChange.bind(this, i)} className={classNames({ active: i === index })} key={i}>
                        <a>{i}</a>
                    </li>
                );
            }, this);
        }

        // Next
        items.push(
            <li key="next" onClick={index >= max ? null : this.handleChange.bind(this, index + 1)} className={classNames({ disabled: index >= max })}>
                <a>&raquo;</a>
            </li>
        );

        var className = classNames(
            this.props.className,
            'rct-pagination-wrap',
            { 'rct-pagination-mini': mini }
        );
        return <div style={this.props.style} className={className}>
                <ul className="rct-pagination">
                    {items}
                </ul>
                {
                    this.props.jumper && !mini &&
                    <form onSubmit={this.setInput}>
                        <div className="rct-input-group">
                            <input ref="input" defaultValue={this.state.index} type="text" className="rct-form-control" />
                            <span onClick={this.setInput} className="addon">go</span>
                        </div>
                    </form>
                }
            </div>;
    }

});
