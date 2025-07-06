# -*- coding: utf-8 -*-
{
    'name': "SD Seismology",
    'summary': """
        """,
    'description': """
        
    """,
    'author': "Arash Homayounfar",
    'category': 'Service Desk/Service Desk',
    'application': True,
    'version': '18.0.1.0.0',
    'depends': ['base', 'web', 'sd_projects'],
    'external_dependencies': {
        'python': ['jdatetimext', 'simplekml', 'polycircles']
    },
    'data': [
        'security/security.xml',
        'security/ir.model.access.csv',
        # 'report/daily_records_report.xml',
        # 'report/daily_records_template.xml',
        # 'data/cron.xml',
        # 'data/ir_sequence.xml',
        # 'data/weather_data.xml',
        # 'data/hazard_types_data.xml',
        # 'views/sd_projects_views.xml',
        # 'views/remote_server_views.xml',
        # 'views/activities_views.xml',
        'wizard/kml_wizard.xml',
        'views/views.xml',
    ],
    'assets': {

        'web.assets_frontend': [

        ],
        'web.assets_backend': [
            # 'sd_hse/static/src/css/style.scss',
            # 'sd_hse/static/src/components/web/**/*',
            # 'sd_hse/static/src/js/**/*.js',
            # 'sd_hse/static/src/js/**/*.css',
        ],
        'web.report_assets_common': [
        ],
        # "web.chartjs_lib": [
        #     '/web/static/lib/Chart/Chart.js',
        #     '/web/static/lib/chartjs-adapter-luxon/chartjs-adapter-luxon.js',
        # ],

    },

    # only loaded in demonstration mode
    'demo': [
        # 'demo/demo.xml',
    ],
    'license': 'LGPL-3',

}
