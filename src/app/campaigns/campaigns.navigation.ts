import {Component, ChangeDetectionStrategy, ViewChild, trigger, transition, animate, state, style} from "@angular/core";
import {ApplicationState} from "../../store/application.state";
import {Store} from "@ngrx/store";
import {Observable} from "rxjs";
import * as _ from "lodash";
import {List} from "immutable";
import {Compbaser} from "ng-mslib";
import {Router} from "@angular/router";
import {EFFECT_RENAME_CAMPAIGN, EFFECT_REMOVE_CAMPAIGN, EFFECT_CREATE_CAMPAIGN_BOARD} from "../../store/effects/msdb.effects";
import {UserModel} from "../../models/UserModel";
import {CampaignsModal, ResourcesModal} from "../../store/imsdb.interfaces_auto";
import {RedPepperService} from "../../services/redpepper.service";

@Component({
    selector: 'CampaignsNavigation',
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        '[@routeAnimation]': 'true',
        '[style.display]': "'block'"
    },
    animations: [
        trigger('routeAnimation', [
            state('*', style({opacity: 1})),
            transition('void => *', [
                style({opacity: 0}),
                animate(333)
            ]),
            transition('* => void', animate(333, style({opacity: 0})))
        ])
    ],
    styles: [`
        button {
            width: 200px;
            margin: 5px;
        }
    `],
    template: `
               <h2>StudioWeb</h2>
               <button (click)="onRoute1()">camp</button>
               <button (click)="onRoute2()">fq</button>
               <button (click)="onRoute3()">res</button>
               <button (click)="onRoute4()">sett</button>
               <button (click)="onRoute5()">stations</button>
               <button (click)="onRoute6()">pro</button>
               <h4>user name: {{(userModel$ | async)?.getUser() }}</h4>
               <h4>account type: {{(userModel$ | async)?.getAccountType()}}</h4>
               <div style="display: flex" >
                   <canvas #canvas1 width="300" height="300"></canvas>
                   <canvas #canvas2 width="300" height="300"></canvas>
                </div>
               <h2>selected: {{selectedCampaign?.getCampaignName()}}</h2>
               <button class="btn btn-primary" (click)="createCampaign()">create campaign</button>
               <br/>
               <button class="btn btn-primary" (click)="save()">save to server</button>
                <ul class="list-group">
                   <li  class="list-group-item" *ngFor="let campaign of campaigns$ | async">
                        <input #ren (focus)="selectedCampaign=campaign" (blur)="selectedCampaign=campaign ; renameCampaign(campaign,ren.value)" value="{{campaign?.getCampaignName()}}">
                        <button (click)="removeCampaign(campaign)" class="fa fa-remove"></button>
                    </li>
                </ul>
           `,
})
export class CampaignsNavigation extends Compbaser {

    public campaigns$: Observable<any>;
    public userModel$: Observable<UserModel>;
    public fabricCanvas1: fabric.IStaticCanvas;
    public fabricCanvas2: fabric.IStaticCanvas;
    public selectedCampaign: CampaignsModal;

    @ViewChild('canvas1')
    canvas1;

    @ViewChild('canvas2')
    canvas2;

    constructor(private store: Store<ApplicationState>, private redPepperService: RedPepperService, private router: Router) {
        super();


        this.store.select(store => store.msDatabase.participants[0].a.c).map((v) => {
            console.log(v);
        }).subscribe((e) => {
        });
        setTimeout(() => {
            this.store.dispatch(({type: 'AAA'}))
        }, 500)
        this.userModel$ = this.store.select(store => store.appDb.userModel);
        this.campaigns$ = this.store.select(store => store.msDatabase.sdk.table_campaigns).map((list: List<CampaignsModal>) => {
            return list.filter((campaignModel: CampaignsModal) => {
                if (campaignModel.getCampaignName().indexOf('bla_bla') > -1)
                    return false
                return true;
            })
        });
        this.store.select(store => store.msDatabase.sdk.table_resources).subscribe((resourceModels: List<ResourcesModal>) => {
            console.log(resourceModels.first().getResourceName());
            console.log(resourceModels.first().getResourceBytesTotal());
        })
    }

    onRoute1() {
        this.router.navigate(['/App1/Campaigns'])
    }

    onRoute2() {
        this.router.navigate(['/App1/Fasterq'])
    }

    onRoute3() {
        this.router.navigate(['/App1/Resources'])
    }

    onRoute4() {
        this.router.navigate(['/App1/Settings'])
    }

    onRoute5() {
        this.router.navigate(['/App1/Stations'])
    }

    onRoute6() {
        this.router.navigate(['/App1/StudioPro'])
    }


    private removeCampaign(campaign: CampaignsModal) {
        this.store.dispatch({type: EFFECT_REMOVE_CAMPAIGN, payload: campaign})
    }

    private renameCampaign(campaign, newName) {
        this.fabricCanvas1.setZoom(_.random(1, 1.5));
        this.fabricCanvas2.setZoom(_.random(1, 1.1));
        this.store.dispatch({type: EFFECT_RENAME_CAMPAIGN, payload: {campaign: campaign, newName: newName}})
    }


    ngOnInit() {
        this.fabricCanvas1 = new fabric.Canvas(this.canvas1.nativeElement);
        var rect = new fabric.Rect({
            top: 100,
            left: 100,
            width: 60,
            height: 70,
            fill: 'blue'
        });
        this.fabricCanvas1.add(rect);

        this.fabricCanvas2 = new fabric.Canvas(this.canvas2.nativeElement);
        var circle = new fabric.Circle({
            radius: 30,
            stroke: 'green',
            fill: 'green'
        });
        this.fabricCanvas2.add(circle);
    }

    private save() {
        console.log('saving...');
        this.redPepperService.save((result) => {
            alert('saved');
            console.log(result);
        });
    }
    private createCampaign() {
        this.store.dispatch({type: EFFECT_CREATE_CAMPAIGN_BOARD});
    }

    destroy() {
    }
}

