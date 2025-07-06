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



class SdSeismologyRecords(models.Model):
    _name = 'sd_seismology.spots'
    _description = 'Spots Records'
    _inherit = ['mail.thread', 'mail.activity.mixin']

    name = fields.Char(required=True)
    project_name = fields.Many2one('sd_projects.projects', required=True)
    line = fields.Char()
    latitude = fields.Char()
    longitude = fields.Char()
    date_plane = fields.Date()
    state = fields.Selection([('planed', 'Planed'),
                              ('ongoing', 'Ongoing'),
                              ('stop', 'Stop'),
                              ('done', 'Done'), ], default='planed')


