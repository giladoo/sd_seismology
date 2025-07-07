/** @odoo-module */
import { registry } from "@web/core/registry"
import { _t } from "@web/core/l10n/translation";
import { loadBundle } from "@web/core/assets";

import { Component, useRef, useState, onMounted, onWillUnmount, onWillStart, useEffect } from "@odoo/owl"
import { useService } from "@web/core/utils/hooks";
import { Dropdown } from "@web/core/dropdown/dropdown";
import { DropdownItem } from "@web/core/dropdown/dropdown_item";
import { ChartBox} from "./chart_box/chart_box"

const COL_3 = ' col-12 col-md-6 col-lg-3 '
const COL_4 = ' col-12 col-md-6 col-lg-4 '
const COL_6 = ' col-12 col-lg-6 '
export class SeismologyMainPanel extends Component {
    static template = "sd_seismology.seismology_panel_template"
    static components = {Dropdown, DropdownItem, ChartBox}
    setup(){
        let self = this;
        this.action = useService("action");
        this.orm = useService('orm')
        this.state = useState({
            projects: [{'id': 0, 'name': 'Office', 'checked': true,spots: 0,  states: {planed: 0, done: 0, stop: 0, ongoing: 0}},],

        })
        onMounted(async () => {
//            self.projectNameListRef ? self.projectNameListRef.el.addEventListener('click', self._onProjectName) : ''
            await this.orm.call('sd_projects.projects', 'get_seismology_projects', [[]])
                .then(data => JSON.parse(data))
                .then(data = > {
                    console.log(data)
                    self.state.projects = data.projects
                    console.log('Projects:\n', self.state.projects)

//                    self.state.project_names.unshift({id: 0, name: _t('All')})
//                    self.state.selectedProject = {id: 0, name: _t('All')}
                })

        })
        this.selectProject = this.selectProject.bind(this)
        }
    selectProject(project_id){
        console.log(project_id)
    }
}

export class SeismologyMainPanel_1 extends Component {
    static template = "sd_seismology.seismology_panel_template"
    static components = {Dropdown, DropdownItem, ChartBox}

    setup(){
        let self = this;
        this.projectNameListRef = useRef('project_name_list_ref')
        this.selectedProject = useRef('selected_project')
        this.action = useService("action");
        this.chart = null;
        this.chartAll = null;
        this.canvasRef = useRef("canvas");
        this.canvasAllRef = useRef("canvas_all");
        this.orm = useService('orm')
        this.state = useState({
            project_names: [{'id': 0, 'name': 'Office', 'checked': true},
            {'id': 1, 'name': 'Aftab', 'checked': true}],
            duration_type: [{'id': 0, 'name': 'duration_type','value': 'Monthly', 'checked': true},
            {'id': 1, 'name': 'duration_type', 'value': 'Annually', 'checked': false}, ],
            selectedProject: {'id': 0, 'name': 'Office', 'checked': true},
            need_action: [],
            projectCharts: [],
            kpis: {'ltif': 0, 'fsi': 0, 'trir': 0, 'sr': 0, 'sa': 0, 'fr': 0, 'far': 0, },
            mainCharts: {
                MAIN_LTIF: {name: 'LTIF; All Projects', description: _t(''), config: {data:[]}, class: COL_4, },
//                MAIN_TRIR: {name: 'TRIR; All Projects', description: _t(''), config: {data:[]}, class: COL_4, },
//                MAIN_SR: {name: 'SR; All Projects', description: _t(''), config: {data:[]}, class: COL_4, },
            },
            charts: {
                LTIF: {name: 'LTIF', description: _t(''), config: {data:[]}, class: COL_6, },
                FSI: {name: 'FSI', description: _t(''), config: {data:[]}, class: COL_6, },
            }
        })
//        console.log('SeismologyMainPanel', this)
        onWillStart(async () => {
            await loadBundle("web.chartjs_lib")
//            self.getChartsData()
//            this.state.mainCharts.MAIN_LTIF.config = this.chartDataCreation([], 'MAIN_LTIF')
        })
        onMounted(async () => {
            self.projectNameListRef ? self.projectNameListRef.el.addEventListener('click', self._onProjectName) : ''
            await this.orm.call('sd_seismology.daily_records', 'get_projects', [[]])
                .then(data => JSON.parse(data))
                .then(data = > {
//                    console.log(data)
                    self.state.project_names = data.projects
                    self.state.project_names.unshift({id: 0, name: _t('All')})
                    self.state.selectedProject = {id: 0, name: _t('All')}
                })
            self.updateProjectButton('All')
//            self.selectProject(0)
        })
        onWillUnmount(() => {
            self.projectNameListRef.el.removeEventListener('click', self._onProjectName)
        })
//                this.chart = new Chart(this.selectedProject, {});
        useEffect(() => {

//            this.renderChart();
            return () => {
                if (this.chartAll) {
                    this.chartAll.destroy();
                }
                if (this.chart) {
                    this.chart.destroy();
                }
            };
        });
        this._onProjectName = this._onProjectName.bind(this)
        this.updateProjectButton = this.updateProjectButton.bind(this)
        this.getDailyRecords = this.getDailyRecords.bind(this)
        this.onDailyReport = this.onDailyReport.bind(this)
//        this.needAction = this.needAction.bind(this)
        this.getChartsData = this.getChartsData.bind(this)
        this.renderChart = this.renderChart.bind(this)
        this.renderChartAll = this.renderChartAll.bind(this)
        this.selectKpi = this.selectKpi.bind(this)
    }
    async selectKpi(e){
        // change button
        let btn = e.target
        let btnParent = e.target.parentElement
        let oldSelected = btnParent.querySelectorAll('.btn-light')
        oldSelected.forEach(elm => {
            elm.classList.remove('btn-light')
            elm.classList.add('btn-outline-light')
            })
        btn.classList.add('btn-light')
        btn.classList.remove('btn-outline-light')

//        console.log('selectKpi:', btn.id, this.state.selectedProject )
        let getChartData = {}
        getChartData = await this.orm.call('sd_seismology.daily_records', 'get_charts_data', [false, [0], btn.id],)
        getChartData = JSON.parse(getChartData)
        this.renderChartAll(getChartData, btn.id.toUpperCase())
    }
    async renderChart(chartData={}){
//        console.log('renderChart:', chartData)
        if(Object.keys(chartData).length === 0){
//            console.log('renderChart 2:', chartData)
            return
        }
        if (this.chart != null) {
            this.chart.destroy();
        }

        const config = {
            type: "line",
            data: chartData.data,
            options: {
                circumference: 180,
                rotation: 270,
                responsive: true,
                maintainAspectRatio: false,
                cutout: "70%",
                layout: {
                    padding: 5,
                },
                    scales: {
                            x: {
                                ticks: {
                                    font: {
                                        family: "IRANSansFN, 'Courier New', monospace" // Set font family for X-axis
                                    }
                                }
                            },
                          y: {
                            type: 'linear',

                            beginAtZero: true,
                                                        ticks: {
                                font: {
                                    family: "IRANSansFN, 'Courier New', monospace" // Set font family for X-axis
                                }
                            },
                          },
//                           y1: {
//                             type: 'linear',
//                             position: 'right',
//
//                             beginAtZero: true,
//                           }
                        },
                plugins: {
//                    title: {
//                        display: true,
//                        text: 'LTIF',
//                        padding: 4,
//                    },
                    legend: {
                        labels: {
                            font: {
                                family: "IRANSansFN, 'Courier New', monospace", // Ensure font family is set here
//                                size: 14,
//                                weight: 'bold'
                            }
                        }
                    }
////                    tooltip: {
////                        displayColors: false,
////                        callbacks: {
////                            label: function (tooltipItem) {
////                                if (tooltipItem.dataIndex === 0) {
////                                    return _t("Value: %(value)s", { value: gaugeValue });
////                                }
////                                return _t("Max: %(max)s", { max: maxLabel });
////                            },
////                        },
////                    },
                },
                aspectRatio: 2,
            },
        };
        this.chart = new Chart(this.canvasRef.el, config);
    }
    async renderChartAll(chartData={}, kpi='LTIF'){
        if(Object.keys(chartData).length === 0){
            return
        }
        if (this.chartAll != null) {
            this.chartAll.destroy();
        }

        const config = {
            type: "line",
            data: chartData.data,
            options: {
                circumference: 180,
                rotation: 270,
                responsive: true,
                maintainAspectRatio: false,
                cutout: "70%",
                layout: {
                    padding: 5,
                },
                    scales: {
                              x: {
                                ticks: {
                                    font: {
                                        family: "IRANSansFN, 'Courier New', monospace" // Set font family for X-axis
                                    }
                                }
                            },

                          y: {
                            type: 'linear',

                            beginAtZero: true,
                            ticks: {
                                font: {
                                    family: "IRANSansFN, 'Courier New', monospace" // Set font family for X-axis
                                }
                            },
                          },
//                           y1: {
//                             type: 'linear',
//                             position: 'right',
//
//                             beginAtZero: true,
//                           }
                        },
                plugins: {
                    title: {
                        display: true,
                        text: kpi,
                        padding: 4,
                    },
                    legend: {
                        labels: {
                            font: {
                                family: "IRANSansFN, 'Courier New', monospace", // Ensure font family is set here
//                                size: 14,
//                                weight: 'bold'
                            }
                        }
                    }

////                    tooltip: {
////                        displayColors: false,
////                        callbacks: {
////                            label: function (tooltipItem) {
////                                if (tooltipItem.dataIndex === 0) {
////                                    return _t("Value: %(value)s", { value: gaugeValue });
////                                }
////                                return _t("Max: %(max)s", { max: maxLabel });
////                            },
////                        },
////                    },
                },
                aspectRatio: 2,
            },
        };
//        this.chart = new Chart(this.canvasRef.el, config);
        this.chartAll = new Chart(this.canvasAllRef.el, config);
//        console.log('chart ALL:', this.chartAll, this.canvasAllRef.el)
//        this.chartAll.defaults.font.family =  "IRANSansFN, 'Courier New', monospace"

    }
    async getChartsData(){
            let getCharts = await this.orm.call('sd_seismology.daily_records', 'get_charts', [false, []])
            getCharts = JSON.parse(getCharts)
            this.state.projectCharts = getCharts
    }
    chartDataCreation(project_ids=[], chartName=''){
        let data = [];
        const layout = {title: chartName};
        return {data: data, layout: layout}
    }
    updateProjectButton(btn=''){
        this.selectedProject.el.innerHTML = this.state.selectedProject.name
        btn == 'All' ? this.getDailyRecords(0) : ''
    }
    async getDailyRecords(project_id){
        let self = this;
        let data = await this.orm.call('sd_seismology.daily_records', 'get_need_action', [[]])
            .then(data => JSON.parse(data))
            .then(data = > {
//                console.log(data)
                self.state.need_action = data.need_action
//                self.state.kpis = data.kpis['0'];
                self.state.kpis = data.kpis;
//                this.state.kpis =  {'ltif': 2, 'fsi': 0, 'trir': 0, 'sr': 0, 'sa': 0, 'fr': 0, 'far': 0, }
            })
//        console.log('project_id:', project_id)
        let getChartData = {}
        getChartData = await this.orm.call('sd_seismology.daily_records', 'get_charts_data', [false, [project_id], 'ltif'])
        getChartData = JSON.parse(getChartData)
//        this.state.kpis = getChartData.kpis;
        this.renderChartAll(getChartData)
        return getChartData

    }
    async selectProject(project){
//        console.log('selectProject', project)
        this.state.selectedProject = project
        this.updateProjectButton()
//        this.getDailyRecords(project.id)
//        let getCharts = await this.orm.call('sd_seismology.daily_records', 'get_charts', [false, [project.id]])
//            getCharts = JSON.parse(getCharts)
        let project_id = this.state.selectedProject ? this.state.selectedProject.id : 0
        if(project_id){
//            console.log('project_id:', project_id)
            let getChartData = {}
            getChartData = await this.orm.call('sd_seismology.daily_records', 'get_charts_data', [false, [project_id], 'ltif'],)
            getChartData = JSON.parse(getChartData)
//            console.log('getChartData', getChartData)
            this.renderChart(getChartData)
        }else{
            this.renderChartAll(this.getDailyRecords(project.id))
//            console.log('project 4444')
        }

    }
    onDailyReport(e, id){
//        console.log('onDailyReport',e, id, this.state.need_action)
        let action_name, res_model, domain, context;
        domain = [['project_name', '=', id]]
        let view_id = false;
        let res_id = false;
        if(e == 'report' && id){
            action_name = _t("Daily Reports");
            res_model = "sd_seismology.daily_records"
            context = {'search_default_not_complited': 1, 'search_default_open': 1, 'search_default_recent': 1, default_project_name: id }

        } else if ( e == 'actions' && id){
            action_name = _t("Action List")
            domain.push(['state', 'not in', ['stop_card', 'dismiss']])
//            console.log('domain:', domain)
            res_model = "sd_seismology.activities"
            context = {'search_default_open': 1, default_project_name: id}

        } else if ( e == 'stop_card' && id){
            action_name = _t("stop_card")
            domain.push(['state', 'in', ['stop_card', 'dismiss']])
//            res_id = 'sd_seismology.stop_card_act_window'
//            res_id = 7

            res_model = "sd_seismology.activities"
            view_id = false
            context = {
                search_default_stop: 1,
                form_view_ref: "sd_seismology.stop_card_form",
                default_project_name: id,
                default_stop_card: true,
//                list_view_ref: "sd_seismology.stop_card_list",
                }
        }else{
            return
        }
        this.action.doAction(
            {
                type: "ir.actions.act_window",
                name: action_name,
                res_model: res_model,
                views: [[false, "list"],[false, "form"]],
                view_mode: "list",
                target: "current",
//                res_id: res_id,
                domain: domain,
                context: context,

            })
    }
    _onProjectName(e){
        let self = this;
        if (e && e.target.tagName == 'INPUT'){
        // todo: all button, clear/set all
            let projectInputs = self.projectNameListRef.el.querySelectorAll('INPUT')
        }
    }
}

registry.category('actions').add('sd_seismology.main_panel', SeismologyMainPanel)