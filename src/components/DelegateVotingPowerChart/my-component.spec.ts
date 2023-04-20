import { newSpecPage } from '@stencil/core/testing';
import { DelegateVotingPowerChart } from './DelegateVotingPowerChart';
import delegateSupportMock from '../../../__mocks__/delegatesSupport.json';

global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve(delegateSupportMock),
  }),
);

describe('delegate-voting-power-chart', () => {
  it('should build', () => {
    expect(new DelegateVotingPowerChart()).toBeTruthy();
  });

  it('renders', async () => {
    const { root } = await newSpecPage({
      components: [DelegateVotingPowerChart],
      html: '<delegate-voting-power-chart></delegate-voting-power-chart>',
    });
    expect(root).toMatchSnapshot();
  });

  // it('renders with values', async () => {
  //   const { root } = await newSpecPage({
  //     components: [DelegateVotingPowerChart],
  //     html: `<delegate-voting-power-chart first="Stencil" last="'Don't call me a framework' JS"></delegate-voting-power-chart>`,
  //   });
  //   expect(root).toEqualHtml(`
  //     <delegate-voting-power-chart first="Stencil" last="'Don't call me a framework' JS">
  //       <mock:shadow-root>
  //         <div>
  //           Hello, World! I'm Stencil 'Don't call me a framework' JS
  //         </div>
  //       </mock:shadow-root>
  //     </delegate-voting-power-chart>
  //   `);
  // });
});
