const PerformanceAnalytic = {
    components: {
        'dropdown-analytic': DropdownAnalytic,
    },
    props: {
        analyticsData: {
            type: Object,
            default: () => {}
        }
    },
    data() {
        return {
            transactionItems: Object.keys(this.analyticsData),
            metricItems: Object.keys(this.analyticsData["All"]),
            analyticsChartData: {
                labels: []
            },
            analyticsContext: null,
            analyticsLine: {
                data:  null
            },
            selectedTransactions: [],
            selectedMetrics: [],
        }
    },
    mounted() {
        this.analyticsContext = document.getElementById("chart-analytics").getContext("2d");
        this.analyticsCanvas();
    },
    methods: {
        analyticsCanvas() {
            this.analyticsLine = Chart.Line(this.analyticsContext, {
                data: this.analyticsChartData,
                options: {
                    responsive: true,
                    hoverMode: 'index',
                    stacked: false,
                    // legendCallback: function (chart) {
                    //     debugger
                    //     console.log(chart)
                    //     let legendHtml = [];
                    //     for (let i = 0; i < chart.data.datasets.length; i++) {
                    //         let cb = '<div class="d-flex mb-3">';
                    //         cb += '<label class="mb-0 w-100 d-flex align-items-center custom-checkbox custom-checkbox__multicolor">'
                    //         cb += '<input class="mx-2 custom__checkbox" id="'+ chart.legend.legendItems[i].datasetIndex +'" type="checkbox" checked="true" style="--cbx-color: ' + chart.legend.legendItems[i].fillStyle + ';"/>';
                    //         cb += '<span class="custom-chart-legend-span"></span>'
                    //         cb += chart.data.datasets[i].label;
                    //         cb += '</label></div>'
                    //         legendHtml.push(cb);
                    //     }
                    //     return legendHtml.join("");
                    // },
                    legend: {
                        display: false,
                        position: 'right',
                        labels: {
                            fontSize: 10,
                            usePointStyle: false
                        }
                    },
                    title:{
                        display: false,
                    },
                    scales: {
                        yAxes: [{
                            type: "linear", // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
                            display: true,
                            position: "left",
                            scaleLabel: {
                                display: true,
                                labelString: "Response Time, ms"
                            },
                            id: "time",
                        }, {
                            type: "linear", // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
                            display: true,
                            position: "right",
                            scaleLabel: {
                                display: true,
                                labelString: "Count"
                            },
                            id: "count",
                            gridLines: {
                                drawOnChartArea: false, // only want the grid lines for one axis to show up
                            },
                        }],
                    }
                },
            })
        },
        setTransactions(payload) {
            this.selectedTransactions = [ ...payload.selectedItems];
            if (payload.clickedItem.isChecked) {
                this.selectedMetrics.forEach(metric => {
                    this.getAnalyticData(metric, payload.clickedItem.title,)
                })
            }
        },
        setMetrics(payload) {
            this.selectedMetrics = [ ...payload.selectedItems];
            if (payload.clickedItem.isChecked) {
                this.selectedTransactions.forEach(transaction => {
                    this.getAnalyticData(payload.clickedItem.title, transaction)
                })
            }
        },
        getAnalyticData(metric, request_name) {
            $.get(
                '/api/v1/backend_performance/charts/requests/data',
                {
                    scope: request_name,
                    metric: metric,
                    build_id: $('meta[property=build_id]').prop('content'),
                    test_name: $('meta[property=test_name]').prop('content'),
                    lg_type: $('meta[property=lg_type]').prop('content'),
                    sampler: $("#sampler").val().toUpperCase(),
                    aggregator: $("#aggregator").val().toLowerCase(),
                    status: $("#status").val().toLowerCase(),
                    start_time: $("#start_time").html(),
                    end_time: $("#end_time").html(),
                    low_value: $("#input-slider-range-value-low").html(),
                    high_value: $("#input-slider-range-value-high").html()
                },
                ( data ) => {
                    if (this.analyticsLine.data.labels.length === 0 ||
                        this.analyticsLine.data.labels.length !== data.labels.length) {
                            this.analyticsChartData = data;
                            this.analyticsCanvas();
                            document.getElementById('chartjs-custom-legend-analytic').innerHTML = this.analyticsLine.generateLegend();

                    } else {
                        this.analyticsLine.data.datasets.push(data.datasets[0]);
                        this.analyticsLine.update();
                    }
                }
            );
        }
    },
    template: `
        <div class="float-left" style="width:100%;">
            <div class="chart float-left" style="width:75%;">
                <canvas id="chart-analytics" class="chart-canvas chartjs-render-monitor"
                    style="display: block; height: 450px; width: 100%;"></canvas>
            </div>
            <div class="card" style="width:25%;">
                <h4>Transaction/Request</h4>
                <dropdown-analytic
                    @select-items="setTransactions"
                    :items-list="transactionItems"
                ></dropdown-analytic>
                
                <h4>Metrics</h4>
                <dropdown-analytic
                    @select-items="setMetrics"
                    :items-list="metricItems"
                ></dropdown-analytic>
                <div id="chartjs-custom-legend-analytic" class="custom-chart-legend d-flex flex-column px-3 py-3"></div>
            </div>
        </div>
    `
}

register_component('performance-analytic', PerformanceAnalytic);