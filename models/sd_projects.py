# -*- coding: utf-8 -*-

from odoo import models, fields, api, _
import json
class SdHseSdProjects(models.Model):
    _inherit = 'sd_projects.projects'

#     record_editors = fields.Many2many('res.users', tracking=True,
#                                    help="Users whom can edit records of this project")
# #
#     _sql_constraints = [
#         ('unique_project_hse_code', 'UNIQUE(project_hse_code)', 'The "project hse code" must be unique!'),
#     ]
    def get_seismology_projects(self):
        projects = self.search_read([], ['name'])
        spots = self.env['sd_seismology.spots'].search([], ).grouped( 'project_name')
        projects = [{'name': k.name, 'id': k.id, 'spots': len(v), 'states': {m: len(n) for m,n in v.grouped('state').items()}} for k,v in spots.items()]

        return json.dumps({'projects': projects})
