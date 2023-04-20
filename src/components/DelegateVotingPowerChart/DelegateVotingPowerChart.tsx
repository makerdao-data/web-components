import { Chart as ChartJS, CategoryScale, LinearScale, TimeScale, PointElement, LineElement, Title, Tooltip, Filler, Legend, LineController } from 'chart.js';
import { Component, Prop, h, State, Element, Watch } from '@stencil/core';
import delegatesWeightChartData, { DelegatesWeightChartData, Support } from '../../transformers/delegatesWeightChartData';
import 'chartjs-adapter-date-fns';
import { ChartOptions } from 'chart.js';

const spacingPlugin = {
  id: 'increase-legend-spacing',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  beforeInit(chart: any) {
    // Get reference to the original fit function
    const originalFit = chart.legend.fit;

    // Override the fit function
    chart.legend.fit = function fit() {
      // Call original function and bind scope in order to use `this` correctly inside it
      originalFit.bind(chart.legend)();
      // Change the height as suggested in another answers
      this.height += 20;
    };
  },
};

ChartJS.register(CategoryScale, LinearScale, LineController, TimeScale, PointElement, LineElement, Title, Tooltip, Filler, Legend, spacingPlugin);

@Component({
  tag: 'delegate-voting-power-chart',
  styleUrl: 'delegate-voting-power-chart.css',
  scoped: true,
})
export class DelegateVotingPowerChart {
  @Prop() token: string;
  @Prop() height: string = '500px';
  @Prop() width: string = '100%';
  @Prop() sx: string = '{}';
  @Prop() chartOptions: ChartOptions<'line'> = {};

  @State() loading: boolean = false;
  @State() error: Error | null = null;
  @State() data: DelegatesWeightChartData = { datasets: [] };

  protected myChartInstance: any;
  @Element()
  private el: HTMLElement;
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;

  componentWillLoad() {
    this.loading = true;
    const fromDate = new Date(new Date().setFullYear(new Date().getFullYear() - 1));

    try {
      fetch(
        'https://data-api.makerdao.network/v1/governance/delegates_support?' +
          new URLSearchParams({
            from_date: `${fromDate.getFullYear()}-${fromDate.getMonth()}-${fromDate.getDate()}`,
            type: 'recognized',
          }),
        {
          headers: { Authorization: `Bearer ${this.token}` },
        },
      )
        .then(response => response.json())
        .then((data: Support[]) => {
          this.data = delegatesWeightChartData(data);
          this.loading = false;
          this.error = null;
        });
    } catch (err) {
      console.error(err);
      this.error = err;
    }
  }

  @Watch('data')
  watchPropHandler(newData: DelegatesWeightChartData) {
    this.myChartInstance.data.datasets = newData.datasets;

    this.myChartInstance.update();
  }

  componentDidLoad() {
    // this.canvas = this.el.shadowRoot.querySelector('canvas');
    this.canvas = this.el.querySelector('canvas');

    this.context = this.canvas.getContext('2d');

    const chartConfig: any = {
      type: 'line',
      data: this.data,
      options: {
        hover: {},
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top' as const,
            align: 'start',
            labels: {
              usePointStyle: true,
              pointStyle: 'circle',
              color: '#231536',
            },
          },
          title: {
            display: false,
          },
          tooltip: {
            mode: 'x' as const,
            itemSort: (a: any, b: any) => {
              return b.raw.y - a.raw.y;
            },
          },
          filler: {
            propagate: false,
          },
        },
        scales: {
          x: {
            type: 'time',
            time: {
              tooltipFormat: 'MMM dd, yyyy',
              unit: 'month',
            },
            title: {
              display: false,
            },
            grid: {
              display: false,
            },
            ticks: {
              color: '#231536',
            },
          },
          y: {
            stacked: true,
            title: {
              display: false,
            },
            grid: {
              color: '#ECECEC',
            },
            ticks: {
              color: '#231536',
              format: { notation: 'compact' },
            },
          },
        },
        elements: {
          line: {
            tension: 0.4,
          },
        },
        ...this.chartOptions,
      },
    };

    this.myChartInstance = new ChartJS(this.context, chartConfig);
  }

  render() {
    if (this.error) {
      return <div class="delegate-voting-power-chart-error-message">Something went wrong while fetching the data.</div>;
    }

    return (
      <div class="delegate-voting-power-chart-container" style={{ position: 'relative', height: this.height, width: this.width }}>
        {this.loading ? <div class="delegate-voting-power-chart-skeleton-loader" style={{ height: this.height, width: this.width }}></div> : null}

        <canvas width={this.width} height={this.height} style={{ display: this.loading ? 'none' : 'block' }} />
      </div>
    );
  }
}
