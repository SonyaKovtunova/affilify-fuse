import { Component, ElementRef, OnDestroy, OnInit, QueryList, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FuseConfigService } from '@fuse/services/config.service';
import { AuthService } from 'app/core/auth.service';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {

  hero: any;
  userCourses: any = [];
  popular: any = [];
  trending: any = [];
  single: any;
  originals: any = [];
  top: any = [];
  categories: any = [];
  webinars: IWebinarPublic[] = [];

  @ViewChild('videoPlayer') videoplayer: ElementRef;
  @ViewChildren(SliderSectionAffilifyComponent, { read: SliderSectionAffilifyComponent })
  private sliders: QueryList<SliderSectionAffilifyComponent>;

  wishCourses: any[]; // list of courses in wishlist
  dialogRef: any;
  user: any;
  eventSubscription: any;
  orderInfo: IOrder[];
  orderToken: string;
  
  private _unsubscribeAll: Subject<any>;
  
  constructor(
    private _fuseConfigService: FuseConfigService,
    private _activatedRoute: ActivatedRoute,
    public deviceService: DeviceService,
    private _authService: AuthService,
    private dialog: MatDialog,
    private homeService: HomeService,
    private wishlistService: WishlistService,
    private eventService: EventService,
    private webinarService: WebinarService,
    private invoiceService: InvoiceService) { 
    this._fuseConfigService.config = {
    layout: {
        navbar   : {
            hidden: true
        },
        toolbar  : {
            hidden: false
        },
        footer   : {
            hidden: false,
            position: 'above' //| 'above-static' | 'above-fixed' | 'below' | 'below-static' | 'below-fixed'
        },
        sidepanel: {
            hidden: true
        }
      }
    };

    this._unsubscribeAll = new Subject(); 
  }

  ngOnInit(): void {

    this._activatedRoute.queryParams
      .subscribe(params => {
        if (params.token) {
          this.invoiceService.getInvoiceByToken(params.token)
            .subscribe((data) => {
              this.orderInfo = data;
              this.openPaymentConfirmationDialog();
            });  
        }
      });

    // todo: check
    this._authService.currentUser$.subscribe(data => {
      this.user = data;
      this.getHome();
    })

    // course details subscription
    this.eventSubscription = this.eventService.CourseDetailedEvent.subscribe(resp => {
      this.openCourseInfo(resp)
    })

    // wishlist slider
    if (!this._authService.isAnonymousUser()) {
      this.getWishlistInfo();
      this.wishlistService.onChange.subscribe(resp => {
        this.getWishlistInfo();
      });
    }

    //update information about is in wishlist for "static: courses on homepage
    this.wishlistService.onCourseSet.subscribe(value => {
      if (value.id && (value.IsUserWishlist === true || value.IsUserWishlist === false)) {

        if (this.hero.id == value.id) {
          this.hero.isUserWishlist = value.IsUserWishlist
        }

        if (this.single.id == value.id) {
          this.single.isUserWishlist = value.IsUserWishlist
        }

        this.originals.forEach(element => {
          if (element.id == value.id) {
            element.isUserWishlist = value.IsUserWishlist
          }
        });

        this.popular.forEach(element => {
          if (element.id == value.id) {
            element.isUserWishlist = value.IsUserWishlist
          }
        });

        this.top.forEach(element => {
          if (element.id == value.id) {
            element.isUserWishlist = value.IsUserWishlist
          }
        });

        this.trending.forEach(element => {
          if (element.id == value.id) {
            element.isUserWishlist = value.IsUserWishlist
          }
        });

      }
    })
  }


  ngOnDestroy() {
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }

  openCourseInfo(id) {
    if (!this.dialogRef?.componentInstance) {
      this.dialogRef = this.dialog.open(CourseInfoComponent, {
        panelClass: ['homepage-dialog-container'],
        data: {
          id: id,
          isDialog: true
        },
        maxHeight: '90vh',
        maxWidth: '100vw'
      });
    }
    else {
      this.dialogRef.componentInstance.reloadCourse(id)
    }
  }

  onTileDetailsClick(courseId) {
    this.sliders.forEach(e => e.clearDetailed())
  }

  getWishlistInfo() {
    this.wishlistService.getWishlist().subscribe(resp => {
      this.wishCourses = resp.map(el => {
        el.isUserWishlist = true
        return el
      });
    });
  }
  openPaymentConfirmationDialog() {
    const dialogRef = this.dialog.open(PaymentConfirmationDialogComponent, {
      data: this.orderInfo,
      panelClass: 'padding-dialog-container'
    });
  }

  getHome() {
    this.webinarService.getForHomePage()
      .subscribe((data) => {
        this.webinars = data;
      });
    
    if (!this._authService.isAnonymousUser()) {
      this.homeService.getUserCourses()
        .subscribe(data => {
          this.userCourses = data;
        });
    }

          //getPopular
          this.homeService.getPopular()
            .subscribe(data => {
              this.popular = data;
            },
              error => { },
              () => {
                //getTrending
                this.homeService.getTrending()
                  .subscribe(data => {
                    this.trending = data;
                  },
                    error => { },
                    () => {
                      //getSingle
                      this.homeService.getSingle()
                        .subscribe(data => {
                          this.single = data;
                        },
                          error => { },
                          () => {
                            //getOriginals
                            this.homeService.getOriginals()
                              .subscribe(data => {
                                this.originals = data;
                              },
                                error => { },
                                () => {
                                  //getTop
                                  this.homeService.getTop()
                                    .subscribe(data => {
                                      for (let index = 0; index < data.length; index++) {
                                        data[index].orderNumber = index + 1;
                                      }
                                      this.top = data;
                                    },
                                      error => { },
                                      () => {
                                        this.homeService.getCategories()
                                          .subscribe(data => {
                                            this.categories = data;
                                            console.log(this.categories);
                                          });
                                      });
                                });
                          });
                    });
              });

  }
}
