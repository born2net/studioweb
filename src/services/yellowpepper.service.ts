import {Injectable} from "@angular/core";
import {Action, Store} from "@ngrx/store";
import {ApplicationState} from "../store/application.state";
import {Observable} from "rxjs";
import {CampaignsModelExt} from "../store/model/msdb-models-extended";
import {List} from "immutable";
import * as _ from "lodash";

import {
    BoardsModel,
    BoardTemplatesModel,
    BoardTemplateViewersModel,
    CampaignTimelineBoardTemplatesModel,
    CampaignTimelineBoardViewerChanelsModel,
    CampaignTimelineSequencesModel,
    CampaignTimelinesModel
} from "../store/imsdb.interfaces_auto";
import {IScreenTemplateData} from "../comps/screen-template/screen-template";
import {OrientationEnum} from "../app/campaigns/campaign-orientation";

@Injectable()
export class YellowPepperService {

    constructor(private store: Store<ApplicationState>) {
    }

    public dispatch(action: Action) {
        this.store.dispatch(action);
    }

    public get ngrxStore(): Store<ApplicationState> {
        return this.store;
    }

    /**
     Listen to when a campaign is selected via the store state uiState.campaign.campaignSelected
     @method listenCampaignSelected
     @param {Observable<CampaignsModelExt>} i_campaign_id
     **/
    public listenCampaignSelected(): Observable<CampaignsModelExt> {

        var campaignSelected$ = this.store.select(
            store => store.appDb.uiState.campaign.campaignSelected
        );
        var campaignsList$ = this.store.select(
            store => store.msDatabase.sdk.table_campaigns
        );
        return campaignSelected$.withLatestFrom(
            campaignsList$,
            (campaignId, campaigns) => {
                return campaigns.find((i_campaign: CampaignsModelExt) => {
                    return i_campaign.getCampaignId() == campaignId;
                });
            });
    }

    /**
     Get all timeline ids for specified campaign
     @method getCampaignTimelines
     @param {Number} i_campaign_id
     **/
    getCampaignTimelines(i_campaign_id: number): Observable<List<CampaignTimelinesModel>> {
        return this.store.select(store => store.msDatabase.sdk.table_campaign_timelines)
            .map((campaignTimelinesModels: List<CampaignTimelinesModel>) => {
                return campaignTimelinesModels.filter((campaignTimelinesModel: CampaignTimelinesModel) => {
                    return campaignTimelinesModel.getCampaignId() == i_campaign_id;
                });
            }).take(1);
    }

    /**
     Get the sequence index of a timeline in the specified campaign
     @method getCampaignTimelineSequencerIndex
     @param {Number} i_campaign_timeline_id
     **/
    getCampaignTimelineSequencerIndex(i_campaign_timeline_id): Observable<number> {
        return this.store.select(store => store.msDatabase.sdk.table_campaign_timeline_sequences)
            .map((campaignTimelineSequencesModels: List<CampaignTimelineSequencesModel>) => {
                var found: CampaignTimelineSequencesModel = campaignTimelineSequencesModels.find((campaignTimelineSequencesModel: CampaignTimelineSequencesModel) => {
                    return campaignTimelineSequencesModel.getCampaignTimelineId() == i_campaign_timeline_id
                });
                return found.getSequenceIndex();
            }).take(1);
    }

    /**
     Get all the campaign > timeline > board > template ids of a timeline
     @method getTemplatesOfTimeline
     @param {Number} i_campaign_timeline_id
     @return {Array} template ids
     **/
    getTemplatesOfTimeline(i_campaign_timeline_id): Observable<Array<number>> {
        return this.store.select(store => store.msDatabase.sdk.table_campaign_timeline_board_templates)
            .map((campaignTimelineBoardTemplatesModels: List<CampaignTimelineBoardTemplatesModel>) => {
                return campaignTimelineBoardTemplatesModels.reduce((result: Array<number>, campaignTimelineBoardTemplatesModel: CampaignTimelineBoardTemplatesModel) => {
                    if (campaignTimelineBoardTemplatesModel.getCampaignTimelineId() == i_campaign_timeline_id)
                        result.push(campaignTimelineBoardTemplatesModel.getCampaignTimelineBoardTemplateId());
                    return result;
                }, [])
            }).take(1);
    }

    /**
     Build screenProps json object with all viewers and all of their respective attributes for the given timeline_id / template_id
     @method getTemplateViewersScreenProps
     @param {Number} i_campaign_timeline_id
     @param {Number} i_campaign_timeline_board_template_id
     @return {Object} screenProps all viewers and all their properties
     **/
    getTemplateViewersScreenProps(i_campaign_timeline_id, i_campaign_timeline_board_template_id, timelineName = ''): Observable<IScreenTemplateData> {

        var table_campaign_timeline_board_templates$ = this.store.select(store => store.msDatabase.sdk.table_campaign_timeline_board_templates);
        var table_campaign_timeline_board_viewer_chanels$ = this.store.select(store => store.msDatabase.sdk.table_campaign_timeline_board_viewer_chanels);
        var table_board_template_viewers$ = this.store.select(store => store.msDatabase.sdk.table_board_template_viewers);
        var table_board_templates = this.store.select(store => store.msDatabase.sdk.table_board_templates);
        var table_boards$ = this.store.select(store => store.msDatabase.sdk.table_boards);

        var counter = -1;
        var screenProps = {};
        var viewOrderIndexes = {};
        var boardWidth;
        var boardHeight;
        var boardOrientation;

        return Observable.combineLatest(
            table_campaign_timeline_board_templates$,
            table_board_template_viewers$,
            table_campaign_timeline_board_viewer_chanels$,
            table_board_templates,
            table_boards$,

            (campaignTimelineBoardTemplatesModels: List<CampaignTimelineBoardTemplatesModel>,
             boardTemplateViewersModels: List<BoardTemplateViewersModel>,
             campaignTimelineBoardViewerChanelsModels: List<CampaignTimelineBoardViewerChanelsModel>,
             boardTemplates: List<BoardTemplatesModel>,
             boardsModel: List<BoardsModel>) => {

                campaignTimelineBoardViewerChanelsModels.forEach((campaignTimelineBoardViewerChanelsModel: CampaignTimelineBoardViewerChanelsModel, v) => {

                    if (campaignTimelineBoardViewerChanelsModel.getCampaignTimelineBoardTemplateId() == i_campaign_timeline_board_template_id) {

                        var board_template_viewer_id = campaignTimelineBoardViewerChanelsModel.getBoardTemplateViewerId();
                        boardTemplateViewersModels.forEach((recBoardTemplateViewer: BoardTemplateViewersModel) => {
                            if (recBoardTemplateViewer.getBoardTemplateViewerId() == board_template_viewer_id) {

                                var boardId = boardTemplates.find((boardTemplateModel) => {
                                    return boardTemplateModel.getBoardTemplateId() == recBoardTemplateViewer.getBoardTemplateId();
                                }).getBoardId();

                                var boardModel = boardsModel.find((boardModel) => {
                                    return boardModel.getBoardId() == boardId;
                                });
                                boardWidth = boardModel.getBoardPixelWidth();
                                boardHeight = boardModel.getBoardPixelHeight();
                                if (boardWidth>boardHeight){
                                    boardOrientation = OrientationEnum.HORIZONTAL;
                                } else {
                                    boardOrientation = OrientationEnum.VERTICAL;
                                }
                                // console.log(i_campaign_timeline_board_template_id + ' ' + recBoardTemplateViewer['board_template_viewer_id']);
                                counter++;
                                screenProps['sd' + counter] = {};
                                screenProps['sd' + counter]['campaign_timeline_board_viewer_id'] = recBoardTemplateViewer.getBoardTemplateViewerId();
                                screenProps['sd' + counter]['campaign_timeline_id'] = i_campaign_timeline_id;
                                screenProps['sd' + counter]['x'] = recBoardTemplateViewer.getPixelX();
                                screenProps['sd' + counter]['y'] = recBoardTemplateViewer.getPixelY();
                                screenProps['sd' + counter]['w'] = recBoardTemplateViewer.getPixelWidth();
                                screenProps['sd' + counter]['h'] = recBoardTemplateViewer.getPixelHeight();

                                // make sure that every view_order we assign is unique and sequential
                                var viewOrder = recBoardTemplateViewer.getViewerOrder();
                                if (!_.isUndefined(viewOrderIndexes[viewOrder])) {
                                    for (var i = 0; i < 100; i++) {
                                        if (_.isUndefined(viewOrderIndexes[i])) {
                                            viewOrder = i;
                                            break;
                                        }
                                    }
                                }
                                viewOrderIndexes[viewOrder] = true;
                                screenProps['sd' + counter]['view_order'] = viewOrder;
                            }
                        })
                    }
                })
                var screenTemplateData: IScreenTemplateData = {
                    screenProps: screenProps,
                    resolution: `${boardWidth}x${boardHeight}`,
                    screenType: '',
                    orientation: boardOrientation,
                    name: timelineName,
                    scale: 10,
                    campaignTimelineId: i_campaign_timeline_id,
                    campaignTimelineBoardTemplateId: i_campaign_timeline_board_template_id
                }
                return screenTemplateData;
            })
    }

    /**
     Get campaigns
     @method getCampaign
     @param {Number} i_campaign_id
     **/
    getCampaign(i_campaign_id: number): Observable<CampaignsModelExt> {
        return this.store.select(store => store.msDatabase.sdk.table_campaigns)
            .map((campaignModels: List<CampaignsModelExt>) => {
                return campaignModels.find((campaignModel: CampaignsModelExt) => {
                    return campaignModel.getCampaignId() == i_campaign_id;
                });
            }).take(1);
    }


    /*****************************************************/
    // below are some brain dumps and examples only
    /*****************************************************/

    private listenCampaignSelectedExampleWithSwitchMap() {
        var campaignSelected$ = this.store.select(store => store.appDb.uiState.campaign.campaignSelected)
        var campaignsList$ = this.store.select(store => store.msDatabase.sdk.table_campaigns);
        return campaignSelected$.switchMap(i_campaignList => campaignsList$, (campaignId, campaigns) => {
            return campaigns.find((i_campaign: CampaignsModelExt) => {
                return i_campaign.getCampaignId() == campaignId;
            });
        })
    }

    private listenCampaignSelectedExampleFurtherLatestFromSelections() {
        var campaignSelected$ = this.store.select(
            store => store.appDb.uiState.campaign.campaignSelected
        );
        var boards$ = this.store.select(
            store => store.msDatabase.sdk.table_boards
        );
        var campaignsList$ = this.store.select(
            store => store.msDatabase.sdk.table_campaigns
        );
        return campaignSelected$.withLatestFrom(
            campaignsList$,
            (campaignId, campaigns) => {
                return campaigns.find((i_campaign: CampaignsModelExt) => {
                    return i_campaign.getCampaignId() == campaignId;
                });
            }).withLatestFrom(
            boards$,
            (campaign: CampaignsModelExt, boards: List<BoardsModel>) => {
                console.log(boards);
                return campaign;
            });
    }

    private findCampaignByIdTest(i_campaignId: number): Observable<CampaignsModelExt> {
        return this.store.select(store => store.msDatabase.sdk.table_campaigns)
            .take(1)
            .map((i_campaigns: List<CampaignsModelExt>) => {
                // console.log('look up campaign ' + i_campaignId);
                return i_campaigns.find((i_campaign: CampaignsModelExt) => {
                    return i_campaign.getCampaignId() == i_campaignId;
                });
            });
    }

    private findCampaignByIdConcatTemp1(i_campaignId): Observable<CampaignsModelExt> {
        var campaign1$ = this.findCampaignByIdTest(i_campaignId)
        var campaign2$ = this.findCampaignByIdTest(1)
        var campaign3$ = this.findCampaignByIdTest(2)

        return campaign1$.concatMap((x: CampaignsModelExt) => {
            return campaign2$;
        }, (a: CampaignsModelExt, b: CampaignsModelExt) => {
            return a;
        }).concatMap((campaignsModel: CampaignsModelExt) => {
            return this.findCampaignByIdTest(campaignsModel.getCampaignId())
        }, (c: CampaignsModelExt, d: CampaignsModelExt) => {
            console.log(c, d);
            return d;
        }).concatMap((campaignsModel: CampaignsModelExt) => this.findCampaignByIdTest(campaignsModel.getCampaignId()), (e: CampaignsModelExt, f: CampaignsModelExt) => {
            console.log(e, f);
            return e
        }).take(1)
    }

    private listenCampaignSelectedTemp2(): any {
        return this.store.select(store => store.appDb.uiState.campaign.campaignSelected);
    }

    private listenCampaignSelectedTemp3(): Observable<CampaignsModelExt> {

        var campaignSelected$ = this.store.select(store => store.appDb.uiState.campaign.campaignSelected)
        var campaigns$ = this.store.select(store => store.msDatabase.sdk.table_campaigns);

        return campaignSelected$.combineLatest(campaigns$, (campaignId: number, campaigns: List<CampaignsModelExt>) => {
            return campaigns.find((i_campaign: CampaignsModelExt) => {
                return i_campaign.getCampaignId() == campaignId;
            });
        })
    }
}
