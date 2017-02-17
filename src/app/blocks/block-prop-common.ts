import {AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input} from "@angular/core";
import {FormBuilder, FormControl, FormGroup} from "@angular/forms";
import {Compbaser, NgmslibService} from "ng-mslib";
import {YellowPepperService} from "../../services/yellowpepper.service";
import {Lib} from "../../Lib";
import * as _ from "lodash";
import {BlockService, IBlockData} from "./block-service";
import {HelperPepperService} from "../../services/helperpepper-service";
import {timeout} from "../../decorators/timeout-decorator";

@Component({
    selector: 'block-prop-common',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div>
            <form novalidate autocomplete="off" [formGroup]="contGroup">
                <div class="row">
                    <div class="inner userGeneral">
                        <div class="panel panel-default tallPanel">
                            <div class="panel-heading">
                                <small class="release">target properties
                                    <i style="font-size: 1.4em" class="fa fa-cog pull-right"></i>
                                </small>
                                <small class="debug">{{me}}</small>
                            </div>
                            <ul class="list-group">
                                <li class="list-group-item">
                                    alpha
                                    <input id="slider1" (change)="_onAlphaChange($event)" [formControl]="contGroup.controls['alpha']" type="range" min="0" max="1" step="0.1"/>
                                </li>
                                <li class="list-group-item">
                                    background
                                    <button style="position: relative; top: 15px" (click)="_onRemoveBackground()" class="btn btn-default btn-sm pull-right" type="button">
                                        <i class="fa fa-times"></i>
                                    </button>
                                    <div id="bgColorGradientSelector"></div>
                                </li>

                                <li class="list-group-item">
                                    <div style="padding-top: 20px; padding-bottom: 20px">
                                        border
                                        <div class="material-switch pull-right">
                                            <input
                                                    [formControl]="contGroup.controls['border']"
                                                    id="borderSelection" #borderSelection
                                                    name="borderSelection" type="checkbox"/>
                                            <label for="borderSelection" class="label-primary"></label>
                                        </div>
                                        <input [(colorPicker)]="m_color" [cpPosition]="'bottom'" [style.background]="m_color" [value]="m_color"/>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </form>
        </div>
        <!--<input id="sceneBackgroundSelector" type="text" name="colorSelect" class="fontSelectorMiniColor fontFormatter form-control minicolor-mini" data-control="hue">-->
        <h5>block id {{m_blockData.blockID}}</h5>
    `,
    styles: [`
        input.ng-invalid {
            border-right: 10px solid red;
        }

        .material-switch {
            position: relative;
            padding-top: 10px;
        }

        .input-group {
            padding-top: 10px;
        }

        i {
            width: 20px;
        }
    `]
})
export class BlockPropCommon extends Compbaser implements AfterViewInit {

    private formInputs = {};
    private contGroup: FormGroup;
    private m_blockData: IBlockData;
    private m_viewReady: boolean = false;
    m_color;

    constructor(private cd:ChangeDetectorRef, private fb: FormBuilder, private ngmslibService: NgmslibService, private bs: BlockService, private hp: HelperPepperService, private yp: YellowPepperService, private el: ElementRef) {
        super();
        this.contGroup = fb.group({
            'alpha': [0],
            'border': [0]
        });
        _.forEach(this.contGroup.controls, (value, key: string) => {
            this.formInputs[key] = this.contGroup.controls[key] as FormControl;
        })
    }

    @Input()
    set setBlockData(i_blockData) {
        this.m_blockData = i_blockData;
        this._render();
    }

    ngAfterViewInit() {
        this.m_viewReady = true;
        this._bgGradientInit();
        this._render();
    }

    private _render() {
        if (!this.m_viewReady) return;
        this._alphaPopulate();
        this._gradientPopulate();
        this._populateBackgroundCheckbox();
        this._borderPropsPopulate();
    }

    /**
     On changes in msdb model updated UI common alpha properties
     @method _alphaPopulate
     **/
    _alphaPopulate() {
        var self = this;
        var domPlayerData = self.m_blockData.playerDataDom;
        var data = $(domPlayerData).find('Data').eq(0);
        var xSnippet = $(data).find('Appearance').eq(0);
        var a1: any = $(xSnippet).attr('alpha');
        if (_.isUndefined(a1)) a1 = 1;
        this.formInputs['alpha'].setValue(a1)
    }

    _onAlphaChange(event) {
        var domPlayerData = this.m_blockData.playerDataDom;
        var data = $(domPlayerData).find('Data').eq(0);
        var xSnippet = $(data).find('Appearance').eq(0);
        jQuery(xSnippet).attr('alpha', event.target.value);
        this.bs.setBlockPlayerData(this.m_blockData, domPlayerData);
    }

    /**
     Load jquery gradient component once
     @method _bgGradientInit
     **/
    _bgGradientInit() {
        var self = this;
        var lazyUpdateBgColor = _.debounce(function (points, styles) {
            if (points.length == 0)
                return;
            self._gradientChanged({points: points, styles: styles})
            console.log('updated...');
            // BB.comBroker.fire(BB.EVENTS.GRADIENT_COLOR_CHANGED, self, null, {points: points, styles: styles});
        }, 50);

        var gradientColorPickerClosed = function () {
            // console.log('gradient 2');
            // BB.comBroker.fire(BB.EVENTS.GRADIENT_COLOR_CLOSED, self, null);
        };

        jQueryAny('#bgColorGradientSelector', self.el.nativeElement).gradientPicker({
            change: lazyUpdateBgColor,
            closed: gradientColorPickerClosed,
            fillDirection: "90deg"
        });

        // always close gradient color picker on mouseout
        // $('.colorpicker').on('mouseleave', function (e) {
        //     $(document).trigger('mousedown');
        //     console.log('gradient 3');
        // });
    }

    /**
     On changes in msdb model updated UI common gradient background properties
     @method _gradientPopulate
     **/
    _gradientPopulate() {
        var self = this;
        var gradient = jQuery('#bgColorGradientSelector', self.el.nativeElement).data("gradientPicker-sel");
        // gradient.changeFillDirection("top"); /* change direction future support */
        gradient.removeAllPoints();
        var domPlayerData = self.m_blockData.playerDataDom;
        var xSnippet = self._findGradientPoints(domPlayerData);
        var points = $(xSnippet).find('Point');
        if (points.length == 0)
            return this._bgGradientClear();
        $.each(points, function (i, point) {
            var pointColor = Lib.DecimalToHex(jQuery(point).attr('color'));
            var pointMidpoint = (parseInt($(point).attr('midpoint')) / 250);
            gradient.addPoint(pointMidpoint, pointColor, true);
        });
    }

    _bgGradientClear() {
        var self = this;
        var gradient = jQuery('#bgColorGradientSelector', self.el.nativeElement).data("gradientPicker-sel");
        gradient.removeAllPoints();
        gradient.clear();
    }

    /**
     Find the gradient blocks in player_data for selected block
     @method _findGradientPoints
     @param  {object} i_domPlayerData
     @return {Xml} xSnippet
     **/
    _findGradientPoints(i_domPlayerData) {
        var xSnippet = $(i_domPlayerData).find('GradientPoints');
        return xSnippet;
    }

    _onRemoveBackground() {
        this._bgGradientClear();
        var domPlayerData = this.m_blockData.playerDataDom;
        var gradientPoints = this._findGradientPoints(domPlayerData);
        jQuery(gradientPoints).empty();
        this.bs.setBlockPlayerData(this.m_blockData, domPlayerData);
    }


    /**
     Update a block's player_data with new gradient background
     @method _listenGradientChange
     **/
    _gradientChanged(e) {
        var self = this;
        var points: any = e.points;
        var styles = e.styles;
        if (points.length == 0)
            return;
        var domPlayerData = self.m_blockData.playerDataDom;
        var gradientPoints = self._findGradientPoints(domPlayerData);
        $(gradientPoints).empty();
        var pointsXML = "";
        for (var i = 0; i < points.length; ++i) {
            var pointMidpoint: any = (points[i].position * 250);
            var color = Lib.ColorToDecimal(points[i].color);
            var xPoint = '<Point color="' + color + '" opacity="1" midpoint="' + pointMidpoint + '" />';
            // log(xPoint);
            // $(gradientPoints).append(xPoint);
            pointsXML += xPoint;
        }
        // $(domPlayerData).find('GradientPoints').html(pointsXML);
        var xmlString = (new XMLSerializer()).serializeToString(domPlayerData);
        xmlString = xmlString.replace(/<GradientPoints[ ]*\/>/, '<GradientPoints>' + pointsXML + '</GradientPoints>');
        domPlayerData = $.parseXML(xmlString);
        this.bs.setBlockPlayerData(this.m_blockData, domPlayerData);
    }

    /**
     On changes in msdb model updated UI common border properties
     @method _borderPropsPopulate
     **/
    _borderPropsPopulate() {
        var self = this;
        var domPlayerData = self.m_blockData.playerDataDom;
        var xSnippet = self._findBorder(domPlayerData);
        if (xSnippet.length > 0) {
            var color = $(xSnippet).attr('borderColor');
            this._updateBorderColor(true, color)
        } else {
            this._updateBorderColor(false, '16777215')
        }
    }

    @timeout(100)
    _updateBorderColor(i_value, i_color) {
        this.m_color = '#' + Lib.DecimalToHex(i_color);
        this.formInputs['border'].setValue(i_value);
        this.cd.markForCheck();
    }

    /**
     Find the border section in player_data for selected block
     @method _findBorder
     @param  {object} i_domPlayerData
     @return {Xml} xSnippet
     **/
    _findBorder(i_domPlayerData) {
        return $(i_domPlayerData).find('Border');
    }

    /**
     Toggle block background on UI checkbox selection
     @method _toggleBackgroundColorHandler
     @param {event} e
     **/
    _populateBackgroundCheckbox() {
        // var self = this;
        // var xBgSnippet = undefined;
        // var domPlayerData = self.m_blockData.playerDataDom;
        // var xSnippet = $(domPlayerData).find('Background');
        // console.log(xSnippet);
        // $(xSnippet).remove();
        // self._bgPropsUnpopulate();
        // self._setBlockPlayerData(domPlayerData);
        //var checked = jQuery(e.target).prop('checked') == true ? 1 : 0;
        // if (checked) {
        //     self._enableBgSelection();
        //     xBgSnippet = self.hp.getCommonBackgroundXML();
        //     var data = $(domPlayerData).find('Data').eq(0);
        //     var bgData = $(data).find('Background');
        //     if (bgData.length > 0 && !_.isUndefined(bgData.replace)) { // ie bug workaround
        //         bgData.replace($(xBgSnippet));
        //     } else {
        //         $(data).append($(xBgSnippet));
        //     }
        //     var player_data = pepper.xmlToStringIEfix(domPlayerData);
        //     domPlayerData = $.parseXML(player_data);
        //     self._setBlockPlayerData(domPlayerData, BB.CONSTS.NO_NOTIFICATION);
        //     self._gradientPopulate();
        //     //self._announceBlockChanged();
        // } else {
        //     var xSnippet = self._findBackground(domPlayerData);
        //     $(xSnippet).remove();
        //     self._bgPropsUnpopulate();
        //     self._setBlockPlayerData(domPlayerData);
        // }
    }


    // /**
    //  Disable the gradient background UI
    //  @method _bgPropsUnpopulate
    //  **/
    // _bgDisable() {
    //     var self = this;
    //     // $(Elements.SHOW_BACKGROUND).prop('checked', false);
    //     // $(Elements.BG_COLOR_GRADIENT_SELECTOR).hide();
    //     // $(Elements.BG_COLOR_SOLID_SELECTOR).hide();
    //     // var domPlayerData = self._getBlockPlayerData();
    //     // var gradientPoints = self._findGradientPoints(domPlayerData);
    //     // $(gradientPoints).empty();
    // }


    // @timeout()
    // private saveToStore() {
    //     // console.log(this.contGroup.status + ' ' + JSON.stringify(this.ngmslibService.cleanCharForXml(this.contGroup.value)));
    //     if (this.contGroup.status != 'VALID')
    //         return;
    //     // this.rp.setCampaignRecord(this.campaignModel.getCampaignId(), 'campaign_name', this.contGroup.value.campaign_name);
    //     // this.rp.setCampaignRecord(this.campaignModel.getCampaignId(), 'campaign_playlist_mode', this.contGroup.value.campaign_playlist_mode);
    //     // this.rp.setCampaignRecord(this.campaignModel.getCampaignId(), 'kiosk_timeline_id', 0); //todo: you need to fix this as zero is arbitrary number right now
    //     // this.rp.setCampaignRecord(this.campaignModel.getCampaignId(), 'kiosk_mode', this.contGroup.value.kiosk_mode);
    //     // this.rp.reduxCommit()
    // }

    // private renderFormInputs() {
    //     // if (!this.campaignModel)
    //     //     return;
    //     // _.forEach(this.formInputs, (value, key: string) => {
    //     //     let data = this.campaignModel.getKey(key);
    //     //     data = StringJS(data).booleanToNumber();
    //     //     this.formInputs[key].setValue(data)
    //     // });
    // }
    // ;

    destroy() {
        var gradient = jQuery('#bgColorGradientSelector', this.el.nativeElement).data("gradientPicker-sel");
        gradient.destroyed();
    }
}