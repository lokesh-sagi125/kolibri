import { shallowMount, mount } from '@vue/test-utils';
import CreateAccount from '../index.vue';

const sendMachineEvent = jest.fn();
function makeWrapper({ targetFacility } = {}) {
  return mount(CreateAccount, {
    provide: {
      changeFacilityService: {
        send: sendMachineEvent,
      },
      state: {
        value: {
          targetFacility,
        },
      },
    },
  });
}

const getBackButton = wrapper => wrapper.find('[data-test="backButton"]');
const getContinueButton = wrapper => wrapper.find('[data-test="continueButton"]');
const getFullNameTextbox = wrapper => wrapper.find('[data-test="fullNameTextbox"]');
const getUsernameTextbox = wrapper => wrapper.find('[data-test="usernameTextbox"]');
const getPasswordTextbox = wrapper => wrapper.find('[data-test="passwordTextbox"]');
const clickBackButton = wrapper => getBackButton(wrapper).trigger('click');
const clickContinueButton = wrapper => getContinueButton(wrapper).trigger('click');
const setFullNameTextboxValue = (wrapper, value) => {
  getFullNameTextbox(wrapper)
    .find('input')
    .setValue(value);
};
const setUsernameTextboxValue = (wrapper, value) => {
  getUsernameTextbox(wrapper)
    .find('input')
    .setValue(value);
};
const setPasswordTextboxValue = (wrapper, value) => {
  getPasswordTextbox(wrapper)
    .findComponent({ ref: 'password' })
    .find('input')
    .setValue(value);
  getPasswordTextbox(wrapper)
    .findComponent({ ref: 'confirm' })
    .find('input')
    .setValue(value);
};

describe(`ChangeFacility/CreateAccount`, () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it(`smoke test`, () => {
    const wrapper = shallowMount(CreateAccount);
    expect(wrapper.exists()).toBeTruthy();
  });

  it(`shows the message about creating a new account in the target facility`, () => {
    const wrapper = makeWrapper({ targetFacility: { name: 'Test Facility' } });
    expect(wrapper.text()).toContain('New account for ‘Test Facility’ learning facility');
  });

  it(`shows the back button`, () => {
    const wrapper = makeWrapper();
    expect(getBackButton(wrapper).exists()).toBeTruthy();
  });

  it(`shows the continue button`, () => {
    const wrapper = makeWrapper();
    expect(getContinueButton(wrapper).exists()).toBeTruthy();
  });

  it(`shows the full name textbox`, () => {
    const wrapper = makeWrapper();
    expect(getFullNameTextbox(wrapper).exists()).toBeTruthy();
  });

  it(`shows the username textbox`, () => {
    const wrapper = makeWrapper();
    expect(getUsernameTextbox(wrapper).exists()).toBeTruthy();
  });

  describe(`when the target facility doesn't require password on learner accounts`, () => {
    it(`doesn't show the password textbox`, () => {
      const wrapper = makeWrapper({ targetFacility: { learner_can_login_with_no_password: true } });
      expect(getPasswordTextbox(wrapper).exists()).toBeFalsy();
    });
  });

  describe(`when the target facility requires password on learner accounts`, () => {
    it(`shows the password textbox`, () => {
      const wrapper = makeWrapper({
        targetFacility: { learner_can_login_with_no_password: false },
      });
      expect(getPasswordTextbox(wrapper).exists()).toBeTruthy();
    });
  });

  it(`clicking the back button sends the back event to the state machine`, () => {
    const wrapper = makeWrapper();
    clickBackButton(wrapper);
    expect(sendMachineEvent).toHaveBeenCalledWith({
      type: 'BACK',
    });
  });

  describe(`when the new user account form is valid`, () => {
    it(`clicking the continue button sends the continue event to the state machine`, async () => {
      const wrapper = makeWrapper();
      setFullNameTextboxValue(wrapper, 'Test Fullname');
      setUsernameTextboxValue(wrapper, 'testusername');
      setPasswordTextboxValue(wrapper, 'testpassword');
      // wait for validation
      await wrapper.vm.$nextTick();
      clickContinueButton(wrapper);
      expect(sendMachineEvent).toHaveBeenCalledWith({
        type: 'CONTINUE',
      });
    });
  });

  describe(`when the new user account form is invalid`, () => {
    it(`clicking the continue button doesn't send the continue event to the state machine`, () => {
      const wrapper = makeWrapper();
      // the form is empty and therefore invalid
      clickContinueButton(wrapper);
      expect(sendMachineEvent).not.toHaveBeenCalled();
    });
  });
});
