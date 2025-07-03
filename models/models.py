# -*- coding: utf-8 -*-

import json
import logging
import typing
import re
from odoo import models, fields, api, _
from datetime import datetime, date
import pytz

from odoo.api import ValuesType
from odoo.exceptions import ValidationError
from jdatetimext import jdatejs, j_start_end
from icecream import ic
import math
import pandas as pd
import simplekml
from io import BytesIO
import base64
from polycircles import polycircles


class SdSeismologyRecords(models.Model):
    _name = 'sd_seismology.spots'
    _description = 'Spots Records'
    _inherit = ['mail.thread', 'mail.activity.mixin']

    name = fields.Char(required=True)
    project_name = fields.Many2one('sd_projects.projects', required=True)
    latitude = fields.Char()
    longitude = fields.Char()
    date_plane = fields.Date()
    state = fields.Selection([('planed', 'Planed'),
                              ('ongoing', 'Ongoing'),
                              ('stop', 'Stop'),
                              ('done', 'Done'), ], default='planed')


    def create_kml(self):
        kml = simplekml.Kml()
        attachment_model = self.env['ir.attachment']

        active_ids = self.env.context.get('active_ids', False)
        if not active_ids:
            active_ids = [self.id]
        records = self.browse(active_ids)
        ic(records)
        for rec in records:
            kml.newpoint(name=rec.name, coords=[( rec.longitude, rec.latitude )])
        kml_data = kml.kml().encode('utf-8')
        buffer = BytesIO(kml_data)
        buffer.seek(0)
        filename = f"KPE_google_earth_file_{datetime.now().strftime('%Y%m%d_%H%M%S')}.kml"

        attach_id = attachment_model.create({
            'res_model': self._name,
            'res_field': 'output_file',
            'res_id': rec.id,
            'datas': base64.b64encode(kml_data),
            'name': filename,
            'type': 'binary',
        })
        download_url = '/web/content/%s' % attach_id.id
        return { 'type': 'ir.actions.act_url',
                 'url': download_url,
                 'target': 'self',
                 }