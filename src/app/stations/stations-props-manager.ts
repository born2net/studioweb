import {Component} from "@angular/core";
import {Compbaser} from "ng-mslib";
import {Observable} from "rxjs";
import {SideProps} from "../../store/actions/appdb.actions";
import {YellowPepperService} from "../../services/yellowpepper.service";
import {ResourcesModel} from "../../store/imsdb.interfaces_auto";
import {Lib} from "../../Lib";
import {RedPepperService} from "../../services/redpepper.service";

@Component({
    selector: 'stations-props-manager',
    styles: [`
        ul {
            padding: 0
        }
    `],
    template: `
        <small class="debug">{{me}}</small>
        <hr/>
        <ul matchBodyHeight="50" style="overflow-y: auto; overflow-x: hidden" [ngSwitch]="m_sideProps$ | async">
            <div *ngSwitchCase="m_sidePropsEnum.stationProps">
                <h5>station props</h5>
            </div>

            <div *ngSwitchCase="m_sidePropsEnum.miniDashboard">
                <h5>station dashboard</h5>
            </div>

        </ul>



    `,
})
export class StationsPropsManager extends Compbaser {

    m_resourceType;
    m_sideProps$: Observable<SideProps>;
    m_sidePropsEnum = SideProps;
    m_uiUserFocusItem$: Observable<SideProps>;
    m_formatIcon = '';
    m_resourceName = '';
    m_selectedResource: ResourcesModel;
    m_playResource = '';
    m_svgPath = '';
    m_imagePath = '';

    constructor(private yp: YellowPepperService, private rp: RedPepperService) {
        super();
        this.m_uiUserFocusItem$ = this.yp.ngrxStore.select(store => store.appDb.uiState.uiSideProps);
        this.m_sideProps$ = this.yp.ngrxStore.select(store => store.appDb.uiState.uiSideProps);

        this.cancelOnDestroy(
            //
            this.yp.listenResourceSelected()
                .subscribe((i_resource: ResourcesModel) => {
                    this.m_selectedResource = i_resource;
                    this.m_resourceName = this.m_selectedResource.getResourceName();
                    switch (this.m_selectedResource.getResourceType()) {
                        case 'svg':{
                            this.m_formatIcon = 'spinner';
                            this.m_resourceType = 'svg';


                            path = window['g_protocol'] + this.rp.getUserData().domain + '/Resources/business' + this.rp.getUserData().businessID + '/resources/' + this.rp.getResourceNativeID(this.m_selectedResource.getResourceId()) + '.' + 'svg';
                            path = $.base64.encode(path);
                            // var path = window['g_protocol'] + 's3.signage.me/business' + this.rp.getUserData().businessID + '/resources/' + this.rp.getResourceNativeID(this.m_selectedResource.getResourceId()) + '.' + this.m_selectedResource.getResourceType();
                            // var urlPath = $.base64.encode(path);
                            // this.m_svgPath = 'https://secure.digitalsignage.com/proxyRequest/' + path;
                            // console.log(this.m_svgPath);
                            this.m_svgPath = 'https://secure.digitalsignage.com/proxyRequest/' + path;
                            // this.m_svgPath = 'https://secure.digitalsignage.com/proxyRequest/aHR0cHM6Ly9wbHV0by5zaWduYWdlLm1lL1Jlc291cmNlcy9idXNpbmVzczM1ODYxMy9yZXNvdXJjZXMvMzQuc3Zn';
                            break;
                        }
                        case 'jpg':
                        case 'png': {
                            this.m_formatIcon = 'image';
                            this.m_resourceType = 'image';
                            var path = window['g_protocol'] + 's3.signage.me/business' + this.rp.getUserData().businessID + '/resources/' + this.rp.getResourceNativeID(this.m_selectedResource.getResourceId()) + '.' + this.m_selectedResource.getResourceType();
                            this.m_imagePath = path;
                            break;
                        }
                        case 'm4v':
                        case 'mp4':
                        case 'flv': {
                            this.m_formatIcon = 'video-camera';
                            this.m_resourceType = 'video';
                            var path = window['g_protocol'] + 's3.signage.me/business' + this.rp.getUserData().businessID + '/resources/' + this.rp.getResourceNativeID(this.m_selectedResource.getResourceId()) + '.' + this.m_selectedResource.getResourceType();
                            this.m_playResource = path;
                            // path = window['g_protocol'] + BB.Pepper.getUserData().domain + '/Resources/business' +  BB.Pepper.getUserData().businessID + '/resources/' + BB.Pepper.getResourceNativeID(i_recResource['resource_id']) + '.' + ext;
                            console.log(path);
                            break;
                        }
                        case 'swf': {
                            this.m_formatIcon = 'bolt';
                            this.m_resourceType = 'swf';
                            break;
                        }
                    }
                }, (e) => console.error(e))
        )

    }

    _onUpdateResourceName(event) {
        var text = Lib.CleanProbCharacters(this.m_resourceName, 1);
        this.rp.setResourceRecord(this.m_selectedResource.getResourceId(), 'resource_name', text);
        this.rp.reduxCommit();
        // var elem = self.$el.find('[data-resource_id="' + this.m_selectedResource.getResourceId() + '"]');
        // elem.find('span').text(text);
    }

    ngOnInit() {
    }

    destroy() {
    }
}