import {NgModule} from "@angular/core";
import {CommonModule} from "@angular/common";
import {RouterModule} from "@angular/router";
import {CampaignsNavigation} from "./campaigns.navigation";
import {DropdownModule as DropdownModulePrime} from "primeng/primeng";
import {SharedModule} from "../../modules/shared.module";

export const LAZY_ROUTES = [
    {path: ':folder', component: CampaignsNavigation},
    {path: ':folder/:id', component: CampaignsNavigation},
    {path: '**', component: CampaignsNavigation}
];

@NgModule({
    imports: [DropdownModulePrime, SharedModule, CommonModule, RouterModule.forChild(LAZY_ROUTES)],
    declarations: [CampaignsNavigation]
})
export class CampaignsLazyModule {
}