/** @odoo-module */

import { useRef, onMounted, onWillUnmount } from "@odoo/owl";
import { registry } from "@web/core/registry";
import { useService } from "@web/core/utils/hooks";
import { formView } from "@web/views/form/form_view";
import { browser } from "@web/core/browser/browser";
import { session } from "@web/session";

export class SeismologyDailyRecordsFormView extends formView.Controller {
    setup() {
        super.setup();
        let self = this;
        this.orm = useService("orm")
        onMounted(async () => {
            // It makes persian font disabled
//            document.querySelector('body').classList.remove('o_rtl')
            self.anomalyPieChart = this.rootRef.el.querySelector('.anomaly_pie_chart')

            self.anomalyPieChartUpdate()
        })
        onWillUnmount(() => {
//            document.querySelector('body').classList.add('o_rtl')
        })
        this.anomalyPieChartUpdate = this.anomalyPieChartUpdate.bind(this)
    }
    async anomalyPieChartUpdate(){
        let open_total = this.model.root.data.open_total
        let closed_total = this.model.root.data.closed_total
        console.log('Anomaly total:',this.model.root.data.id, open_total, closed_total, )
        if(this.anomalyPieChart){
            let open = 100 * open_total / (open_total + closed_total)
            let openColor = open < 40 ? "ffa38f" : "ff0000"
            this.anomalyPieChart.style.background = `conic-gradient(#${openColor} 0% ${open}%, #8bc34a ${open}% 100% )`
        }
    }

displayName(){
        super.displayName()
        this.anomalyPieChartUpdate()
    }



}

registry.category("views").add("seismology_daily_records_form", {
    ...formView,
    Controller: SeismologyDailyRecordsFormView,
});
