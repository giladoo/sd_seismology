# -*- coding: utf-8 -*-
from odoo import http, _
from odoo.http import request
from odoo.modules.module import get_module_resource
# from odoo.addons.http_routing.models.ir_http import url_for
from odoo.tools import ustr
from datetime import datetime, timedelta
# import datetime
import jdatetime
from werkzeug.wrappers import Response

from icecream import ic
import logging
import json
import base64

class SdSeismologyDownload(http.Controller):
    @http.route('/sd_seismology/kml/<int:attachment_id>', type='http', auth='user')
    def download_kml(self, attachment_id):
        attachment = request.env['ir.attachment'].sudo().browse(attachment_id)
        print(attachment)

        return request.make_response(
            base64.b64decode(attachment.datas),
            headers=[
                ('Content-Type', 'application/vnd.google-earth.kml+xml'),
                ('Content-Disposition', f'inline; filename="{attachment.name}"')
            ]
        )

