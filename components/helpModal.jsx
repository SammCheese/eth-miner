const { FormTitle, Button } = require('powercord/components')
const { Modal } = require('powercord/components/modal')
const { AdvancedScrollerThin } = require('powercord/components')
const { close: closeModal, open: openModal } = require('powercord/modal')
const { React } = require('powercord/webpack')

module.exports = () => {
  return (
    <Modal className='help-modal' size={Modal.Sizes.MEDIUM}>
      <Modal.Header>
        <FormTitle tag='h3'>Help</FormTitle>
        <Modal.CloseButton onClick={closeModal} />
      </Modal.Header>
      <Modal.Content>
        <AdvancedScrollerThin fade={true}>
          <div className='help-markdown'>
            <h4>Common Issues and Info</h4>
            <p>There has been a switch of default pools, we are now mining with stratum+tcp://eth.2miners.com:2020 instead of stratum+tcp://eu1.ethermine.org:4444 by default</p>
            <br />
            <p>You can continue mining on ethermine by entering said pool url in the appropriate field or start over on 2miners</p>
            <hr />
            <h4>My Balance isnt showing!</h4>
            <p>This is caused by using a Pool URL that isnt one of <a href='https://2miners.com/#pools' target="_blank" rel="noopener noreferrer">2Miners</a></p>
            <hr />
            <h4>The Miner isnt Working or stops instantly!</h4>
            <p>There can be Multiple Reasons for that. Your GPU may not have enough VRAM To Start Mining, make sure you have enough (~8 GB VRAM for ETH )</p>
            <hr />
            <h4>Still Facing Issues?</h4>
            <p>Shoot Me a DM! Samm-Cheese#9500 on the Powercord Server</p>
          </div>
        </AdvancedScrollerThin>
      </Modal.Content>
      <Modal.Footer>
        <Button
          look={Button.Looks.LINK}
          color={Button.Colors.TRANSPARENT}
          onClick={closeModal}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  )
}