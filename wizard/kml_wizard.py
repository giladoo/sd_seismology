from odoo import models, fields, api, _
import json
from datetime import datetime
from odoo.exceptions import ValidationError
import simplekml
from io import BytesIO
import base64
from polycircles import polycircles

class SdHrPanel(models.TransientModel):
    _name = 'sd_seismology.kml_wizard'
    _rec_name = 'project_name'

    project_name = fields.Many2one('sd_projects.projects', required=True ,
                                   default=lambda self: self.env.context.get('default_employee_id', False))
    plot = fields.Selection([('circle', 'Circle'), ('point', 'Point'), ],
                            default='circle', required=True)
    name_visible = fields.Boolean(default=False)
    spot_visible = fields.Boolean(default=True)
    radius = fields.Integer(default=50)
    vertices = fields.Integer(default=10)

    label_color = fields.Integer(default=10)
    spot_color = fields.Integer(default=10)
    spot_point_color = fields.Integer(default=10)
    planed_color = fields.Integer(default=10)
    ongoing_color = fields.Integer(default=10)
    stop_color = fields.Integer(default=10)
    done_color = fields.Integer(default=10)

    def create_kml(self, ):
        attachment_model = self.env['ir.attachment']
        spots_model = self.env['sd_seismology.spots']
        records = spots_model.search([('project_name', '=', self.project_name.id)])
        # Build the list of lines
        lines = list({rec['line'] for rec in records})
        lines.sort()

        plot = self.plot if self.plot else 10
        radius = self.radius if self.radius else 50
        vertices = self.vertices  if self.vertices else 10

        vertices_small = 10
        radius_small = 3
        planed_color = '6000ffff'
        ongoing_color = '6000ff00'
        done_color = '600000ff'
        state_color = {'label': 'ffffbb00', 'planed': 'ccffffff', 'ongoing': '80ff00ff', 'done': 'a000ff00',
                       'stop': 'a00000FF', }
        point_mark = True
        spot_mark = True
        name_visible = self.name_visible
        spot_visible = self.spot_visible

        kml = simplekml.Kml()
        names_folder = kml.newfolder(name="Names")
        spots_folder = kml.newfolder(name="Spots")
        name_folders = dict()
        spot_folders = dict()
        # prepare the folders in kml document
        for line in lines:
            name_folders[line] = names_folder.newfolder(name=line)
            spot_folders[line] = spots_folder.newfolder(name=line)

        project = kml.newpoint(name=records[0]['project_name'].name,
                               coords=[(float(records[0]['longitude']), float(records[0]['latitude']))])
        for rec in records:
            if point_mark:
                point = name_folders[rec['line']].newpoint(name=rec['name'],
                                                           coords=[(float(rec['longitude']), float(rec['latitude']))])
                point.style.iconstyle.color = '00ffffff'
                point.style.iconstyle.colormode = 'hide'
                point.style.labelstyle.scale = 0.7
                point.style.labelstyle.color = state_color['label']
                point.visibility = name_visible

            if spot_mark:
                polycircle = polycircles.Polycircle(latitude=float(rec['latitude']),
                                                    longitude=float(rec['longitude']),
                                                    radius=radius,
                                                    number_of_vertices=vertices)
                pol = spot_folders[rec['line']].newpolygon(name=rec['name'], outerboundaryis=polycircle.to_kml())
                pol.style.polystyle.color = state_color[rec['state']]
                # pol.style.polystyle.outline = 0
                pol.visibility = spot_visible

                polycircle = polycircles.Polycircle(latitude=float(rec['latitude']),
                                                    longitude=float(rec['longitude']),
                                                    radius=radius_small,
                                                    number_of_vertices=vertices_small)
                pol = spot_folders[rec['line']].newpolygon(name=rec['name'], outerboundaryis=polycircle.to_kml())
                pol.style.polystyle.color = state_color['label']
                # pol.style.polystyle.outline = 0
                pol.visibility = spot_visible


        kml_data = kml.kml().encode('utf-8')
        filename = f"google_earth_file_{datetime.now().strftime('%Y%m%d_%H%M%S')}.kml"
        attach_id = attachment_model.create({
            'res_model': self._name,
            'res_field': 'output_file',
            'res_id': self.id,
            'datas': base64.b64encode(kml_data),
            'name': filename,
            'type': 'binary',
        })
        download_url = '/web/content/%s' % attach_id.id
        download_url = '/sd_seismology/kml/%s' % attach_id.id
        return { 'type': 'ir.actions.act_url',
                 'url': download_url,
                 'target': 'self',
                 }

    def create_kml1(self, ):
        plot = self.plot if self.plot else 10
        radius = self.radius if self.radius else 10
        vertices = self.vertices  if self.vertices else 10

        kml = simplekml.Kml()
        attachment_model = self.env['ir.attachment']
        spots_model = self.env['sd_seismology.spots']

        # active_ids = self.env.context.get('active_ids', False)
        # if not active_ids:
        #     active_ids = [self.id]
        records = spots_model.search([('project_name', '=', self.project_name.id)])
        if plot == 'circle':
            for rec in records:

                polycircle = polycircles.Polycircle(latitude=float(rec.latitude),
                                                    longitude=float(rec.longitude),
                                                    radius=radius,
                                                    number_of_vertices=vertices)
                pol = kml.newpolygon(name=rec['name'],
                                     outerboundaryis=polycircle.to_kml())
                pol.style.polystyle.color = simplekml.Color.changealphaint(200, simplekml.Color.green)
        elif plot == 'point':
            for rec in records:
                kml.newpoint(name=rec.name, coords=[( rec.longitude, rec.latitude )])


        kml_data = kml.kml().encode('utf-8')

        filename = f"google_earth_file_{datetime.now().strftime('%Y%m%d_%H%M%S')}.kml"

        attach_id = attachment_model.create({
            'res_model': self._name,
            'res_field': 'output_file',
            'res_id': rec.id,
            'datas': base64.b64encode(kml_data),
            'name': filename,
            'type': 'binary',
        })
        download_url = '/web/content/%s' % attach_id.id
        download_url = '/sd_seismology/kml/%s' % attach_id.id
        return { 'type': 'ir.actions.act_url',
                 'url': download_url,
                 'target': 'self',
                 }


    # @api.onchange('documents')
    @api.onchange('employee_id')
    def _documents_count(self):
        documents_model = self.env['sd_hr_documents.attachments']
        relatives_model = self.env['sd_hr_relatives.members']
        domain = [('employee_id', '=', self.employee_id.id)]

        self.documents = documents_model.search(domain)
        self.documents_count = documents_model.sudo().search_count(domain)
        self.relatives = relatives_model.search(domain)

    @api.depends('relatives')
    def _compute_helper_field(self):
        print(f"\n RELATIVES documents: {self.documents}")
        self.helper_field = not self.helper_field
        documents_model = self.env['sd_hr_documents.attachments']
        domain = [('employee_id', '=', self.employee_id.id)]
        #
        # self.documents = documents_model.search(domain)
        self.documents_count = documents_model.sudo().search_count(domain)

    def employee_action_view(self):
        if self.employee_id:
            view_id = self.env.ref('hr.view_employee_form').sudo().read()[0]
            domain = []
            context = {}
            return {
                'name': _('Documents'),
                'domain': domain,
                'res_model': 'hr.employee',
                'type': 'ir.actions.act_window',
                'res_id': self.employee_id.id,
                'view_id': False,
                'view_mode': 'form',
                'context': context
            }
        else:
            return {}


    def employee_action_document_view(self):
        action =False
        return action

