import { BarController, BarElement, CategoryScale, LinearScale, Chart as ChartJS } from 'chart.js';
import { Component, Prop, h, State, Element, Watch } from '@stencil/core';
import 'chartjs-adapter-date-fns';
import { ChartOptions } from 'chart.js';
import { v4 as uuid } from 'uuid';
import 'chart.js/auto';

ChartJS.register(BarController, BarElement, CategoryScale, LinearScale);

type ChartData = {
  labels: string[];
  datasets: any[];
};

@Component({
  tag: 'collateral-composition-bar-chart',
  styleUrl: 'collateral-composition-bar-chart.css',
  scoped: true,
})
export class CollateralCompositionBarChart {
  @Prop() token: string;
  @Prop() height: string = '500px';
  @Prop() width: string = '100%';
  @Prop() sx: string = '{}';
  @Prop() chartOptions: ChartOptions<'bar'> = {};

  @State() loading: boolean = false;
  @State() error: Error | null = null;
  @State() data: ChartData = { labels: [], datasets: [] };

  protected myChartInstance: any;
  @Element()
  private el: HTMLElement;
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;

  componentWillLoad() {
    this.loading = true;

    const mockData = [
      { COLLATERAL: 'ETH', TVL: 44503322, RATIO: 43503322 },
      { COLLATERAL: 'XRP', TVL: 23895233, RATIO: 21895233 },
      { COLLATERAL: 'BCH', TVL: 17862201, RATIO: 15862201 },
      { COLLATERAL: 'LTC', TVL: 20639910, RATIO: 20639910 },
      { COLLATERAL: 'ADA', TVL: 12456032, RATIO: 20639910 },
      { COLLATERAL: 'DOT', TVL: 31657821, RATIO: 1.27 },
      { COLLATERAL: 'LINK', TVL: 39823309, RATIO: 1.46 },
      { COLLATERAL: 'UNI', TVL: 12897840, RATIO: 0.52 },
      { COLLATERAL: 'AAVE', TVL: 23456678, RATIO: 1.1 },
      { COLLATERAL: 'USDC', TVL: 8729100, RATIO: 0.42 },
    ];

    this.data = {
      labels: mockData.map(item => item.COLLATERAL),
      datasets: [
        {
          label: 'TVL',
          backgroundColor: 'rgba(126, 209, 169, 1)',
          borderColor: 'rgba(126, 209, 169, 1)',
          borderWidth: 1,
          data: mockData.map(item => item.TVL),
        },
        {
          label: 'RATIO',
          backgroundColor: 'rgba(88, 168, 340, 1)',
          borderColor: 'rgba(88, 168, 340, 1)',
          borderWidth: 1,
          data: mockData.map(item => item.RATIO),
        },
      ],
    };

    this.loading = false;
  }

  @Watch('data')
  watchPropHandler(newData: ChartData) {
    if (this.myChartInstance) {
      this.myChartInstance.data = newData;

      this.myChartInstance.update();
    }
  }

  componentDidLoad() {
    this.createChart();
    console.log("component did load", this.myChartInstance)
  }

  private createChart() { 
    // Get a unique ID for the current chart instance
    const chartId = uuid();

    // Check if there is an existing chart with the same ID and destroy it
    
    if (this.myChartInstance) {
      this.myChartInstance.destroy();
    }

    // Get the canvas element for the current chart instance
    this.canvas = this.el.querySelector('canvas');
    this.canvas.setAttribute('id', chartId);

    

    // Create a new chart instance
    this.context = this.canvas.getContext('2d');
    const chartConfig: any = {
      type: 'bar',
      data: this.data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            stacked: true,
          },
          y: {
            stacked: true,
            ticks: {
              beginAtZero: true,
              max: 100,
            },
          },
        },
        ...this.chartOptions,
      },
    };

    this.myChartInstance = new ChartJS(this.context, chartConfig);
  }

  render() {
    if (this.error) {
      return <div class="collateral-composition-bar-chart-error-message">Something went wrong while fetching the data.</div>;
    }

    return (
      <div class="collateral-composition-bar-chart-container" style={{ position: 'relative', height: this.height, width: this.width }}>
        {this.loading ? <div class="collateral-composition-bar-chart-skeleton-loader" style={{ height: this.height, width: this.width }}></div> : null}

        <canvas id="collateral-composition-bar-chart" width={this.width} height={this.height} style={{ display: this.loading ? 'none' : 'block' }} />
      </div>
    );
  }
}
