const { React } = require('powercord/webpack');
const { Modal } = require('powercord/components/modal')
const { AdvancedScrollerThin } = require('powercord/components');
const { Text } = require('powercord/components')
const f = require('./Functions');

let log;

module.exports = class Log extends React.Component {
  componentDidMount() {
    this.interval = setInterval(() => {
      log = f.parseLog();
      this.forceUpdate();
    }, 5000);
  }
  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {

    log = f.parseLog();

    return(
      <Modal size={Modal.Sizes.LARGE}>
        <Modal.Content>
          <AdvancedScrollerThin fade={true}>
            {log.map((item, index) => (
              <Text>{item}</Text>
            ))}
          </AdvancedScrollerThin>
        </Modal.Content>
      </Modal>
    );
  }
};
