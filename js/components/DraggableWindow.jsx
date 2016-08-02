import {cloneElement, Children, Component} from 'react';

// Many of the ideas of how to build this as a React componant were stolen
// from: https://github.com/mzabriskie/react-draggable Thanks! @mzabriskie
class DraggableWindow extends Component {
  constructor(props) {
    super(props);
    this.handleMouseDown = this.handleMouseDown.bind(this);
    this.state = {};
  }

  handleMouseDown(e) {
    if (!e.target.classList.contains(this.props.handleClass)) {
      // Prevent going into drag mode when clicking any of the title
      // bar's icons by making sure the click was made directly on the
      // handle
      return true;
    }
    // If the element was 'absolutely' positioned we could simply use
    // offsetLeft / offsetTop however the element is 'relatively'
    // positioned so we're using style.left. parseInt is used to remove the
    // 'px' postfix from the value
    const winStart = {
      left: parseInt(this.body.offsetLeft || 0, 10),
      top: parseInt(this.body.offsetTop || 0, 10)
    };

    // Get starting mouse position
    const mouseStart = {
      left: e.clientX,
      top: e.clientY
    };

    // Mouse move handler function while mouse is down
    const handleMove = (moveEvent) => {
      // Calculate difference offsets between current and starting positions
      const diff = {
        left: moveEvent.clientX - mouseStart.left,
        top: moveEvent.clientY - mouseStart.top
      };

      // These margins were only useful for centering the div, now we
      // don't need them
      this.setState({
        marginLeft: '0px',
        marginTop: '0px',
        left: `${winStart.left + diff.left}px`,
        top: `${winStart.top + diff.top}px`,
        position: 'absolute'
      });
    };

    // Mouse button up
    function handleUp() {
      removeListeners();
    }

    function removeListeners() {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleUp);
    }

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('mouseup', handleUp);
    return false;
  }
  render() {
    return cloneElement(Children.only(this.props.children), {
      ref: (body) => this.body = body,
      onMouseDown: this.handleMouseDown,
      style: {...this.props.children.props, ...this.state}
    });
  }

}

module.exports = DraggableWindow;
