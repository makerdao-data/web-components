import { ChartDataset } from 'chart.js';
import _ from 'lodash';

export function format(first: string, middle: string, last: string): string {
  return (first || '') + (middle ? ` ${middle}` : '') + (last ? ` ${last}` : '');
}

export interface Support {
  /**
   * Date
   * @format date
   */
  date: string;
  /** Type */
  type: string;
  /** Vote Delegate */
  vote_delegate: string;
  /** Delegate */
  delegate: string;
  /** Support */
  support: number;
}

type ChartDataSet = Record<string, Record<string, Support>>;

export type DelegatesWeightChartData = {
  datasets: ChartDataset<'line', (number | { x: string; y: number } | null)[]>[];
};

export default function delegatesWeightChartData(recognizedDelegatesSupport: Support[]): DelegatesWeightChartData {
  const recognizedDelegateNames = Array.from(new Set(recognizedDelegatesSupport?.map(({ delegate }) => delegate)));

  const colors = chartsRgbColorPallete(0.5);

  const recognizedDelegateSupportByDelegate = _.groupBy(recognizedDelegatesSupport, 'delegate');

  const delegateMonthlySupport: ChartDataSet = Object.keys(recognizedDelegateSupportByDelegate).reduce((memo, delegate) => {
    const groupedSupport: Record<string, Support[]> = _.groupBy(recognizedDelegateSupportByDelegate[delegate], support => {
      const date = new Date(support.date);
      return `${date.getFullYear()}/${date.getMonth() + 1}`;
    });

    const lastSupportPerMonth = Object.keys(groupedSupport).reduce((memo, month) => {
      const maxDelegateSupportDate = Math.min(...groupedSupport[month].map(({ date }) => new Date(date).getTime()));

      return {
        ...memo,
        [month]: groupedSupport[month].filter(({ date }) => new Date(date).getTime() === maxDelegateSupportDate)[0],
      };
    }, {});

    return {
      ...memo,
      [delegate]: lastSupportPerMonth,
    };
  }, {});

  const dataSetList = recognizedDelegateNames.map((delegate, index) => {
    const delegateSupport = delegateMonthlySupport[delegate];

    const dataSet = {
      fill: true,
      label: delegate,
      borderColor: colors[index],
      backgroundColor: colors[index],
      data: Object.keys(delegateSupport).map(month => ({
        x: delegateSupport[month].date,
        y: delegateSupport[month].support,
      })),
    };

    return dataSet;
  });

  return {
    datasets: dataSetList,
  };
}

function chartsRgbColorPallete(alpha?: number) {
  const colors = [
    'rgba(250, 220, 189, 1)',
    'rgba(39, 180, 189, 1)',
    'rgba(134, 209, 252, 1)',
    'rgba(210, 81, 224, 1)',
    'rgba(246, 114, 138, 1)',
    'rgba(242, 244, 126, 1)',
    'rgba(137, 137, 224, 1)',
    'rgba(232, 151, 125, 1)',
    'rgba(215, 77, 77, 1)',
    'rgba(213, 240, 245, 1)',
    'rgba(106, 154, 197, 1)',
    'rgba(109, 109, 109, 1)',
    'rgba(250, 134, 252, 1)',
    'rgba(218, 49, 130, 1)',
    'rgba(251, 204, 95, 1)',
    'rgba(0, 192, 156, 1)',
    'rgba(24, 239, 123, 1)',
    'rgba(68, 68, 226, 1)',
    'rgba(250, 114, 84, 1)',
    'rgba(255, 205, 223, 1)',
  ];

  if (alpha) {
    return colors.map(color => color.replace('1)', alpha + ')'));
  }

  return colors;
}
