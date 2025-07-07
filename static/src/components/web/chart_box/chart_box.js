/** @odoo-module **/
import { Component } from "@odoo/owl"
import { useState, useRef, onMounted, onWillStart, onWillUnmount } from '@odoo/owl';
import { loadJS } from "@web/core/assets";
import { loadBundle } from "@web/core/assets";

export class ChartBox extends Component {
    static template = "seismology_chart_box_template";
    static props = { name: String, description: String, class: String, onClick: Function, config: Object, };

    setup(){
        this.chartRef = useRef("chart")
        onWillStart(async ()=>{
//            const plotlyUrl = '/sd_seismology/static/src/lib/plotly-3.0.0.min.js'
//            await loadJS(plotlyUrl)
//                await loadBundle("web.chartjs_lib")
        })
        this.chart = null;
        onMounted(() => this.renderChart())
        this.renderChart = this.renderChart.bind(this)
    }
    renderChart() {
        let self = this;
        const config = this.props.config ? JSON.parse(JSON.stringify(this.props.config)) : {config: {responsive: true, displayModeBar: true}}
//        Plotly.newPlot(this.chartRef.el, config)
        console.log('config chart:', config)

        this.chart = new Chart(this.chartRef.el, config);

    }

}

