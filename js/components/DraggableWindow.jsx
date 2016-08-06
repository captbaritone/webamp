import {cloneElement, Children, Component} from 'react';
import {clamp} from '../utils';

const SNAP_DISTANCE = 15;

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
    const maxLeft = window.innerWidth - this.body.offsetWidth;
    const maxTop = window.innerHeight - this.body.offsetHeight;

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

      let left = winStart.left + diff.left;
      let top = winStart.top + diff.top;

      // Snap to top
      if (top < SNAP_DISTANCE) {
        top = 0;
      }

      // Snap to right
      if (left > maxLeft - SNAP_DISTANCE) {
        left = maxLeft;
      }

      // Snap to left
      if (left < SNAP_DISTANCE) {
        left = 0;
      }

      // Snap to bottom
      if (top > maxTop - SNAP_DISTANCE) {
        top = maxTop;
      }

      // These margins were only useful for centering the div, now we
      // don't need them
      this.setState({
        marginLeft: '0px',
        marginTop: '0px',
        left: `${left}px`,
        top: `${top}px`,
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
