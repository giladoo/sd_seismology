# -*- coding: utf-8 -*-

from odoo import models, fields, api, _

class SdHseSdProjects(models.Model):
    _inherit = 'sd_projects.projects'

#     record_editors = fields.Many2many('res.users', tracking=True,
#                                    help="Users whom can edit records of this project")
# #
#     _sql_constraints = [
#         ('unique_project_hse_code', 'UNIQUE(project_hse_code)', 'The "project hse code" must be unique!'),
#     ]
