import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-custom-carousel',
  templateUrl: './custom-carousel.component.html',
  styleUrls: ['./custom-carousel.component.scss']
})
export class CustomCarouselComponent implements AfterViewInit {

  @ContentChildren(CarouselItemDirective) items: QueryList<CarouselItemDirective>;
  @ViewChildren(CarouselAffilifyItemElement, { read: ElementRef }) private itemsElements: QueryList<ElementRef>;
  @ViewChild('carousel') private carousel: ElementRef;
  @ViewChild('wrapper') private wrapper: ElementRef;

  @Input() hoveredIdx: number = null;
  @Input() isFullScreen = true;
  @Input() isWebinar = false;
  @Output() hoveredIdxChange = new EventEmitter<number>();

  @Input() isHoverable = true;

  private _data
  @Input()
  set data(data: any[]) {
    this._data = data;
    this.reinitDataChanges();
  }

  get data() {
    return this._data;
  }

  @Input() detailedCourseId: number = null;
  @Input() type: string = null;
  @Input() showProgress: string = null;
  @Input() scaleValue = 1.95;
  @Input() offset = '3vw';
  @Input() navButtonClass = 'grey-gradient';
  @Input() currentTile = 0;
  @Input() fixedTileCount: number;
  @Output() detailsClick: EventEmitter<number> = new EventEmitter<number>();

  slideTiming = '0.75s ease';
  hoverTiming = '0.5s ease';
  isNavAvailable = true;

  renderItems: any[];
  wishlistSub;
  private player: AnimationPlayer;

  isScrolled = false;
  activeCount = 6;
  currentOffset = 0;

  navigationArray: any[] = [];

  offsetLeft = null;
  offsetRight = null;
  firstIndex = null;
  lastIndex = null;

  constructor(private wishlistService: WishlistService, private builder: AnimationBuilder) {}

  /*ngOnInit() {
    this.setActiveCount();

    this.wishlistSub =  this.wishlistService.onCourseSet.subscribe(value => {
      if (value.id && (value.IsUserWishlist === true || value.IsUserWishlist === false )) {

        this.renderItems.forEach(element => {
          if (element.id === value.id){
            element.isUserWishlist = value.IsUserWishlist;
          }
        });
      }
    });
  }

  ngOnDestroy() {
    this.wishlistSub.unsubscribe()
  }*/

  private _isViewInit = false;
  ngAfterViewInit() {
    this._isViewInit = true;
    setTimeout(() => {
      this.setActiveCount();
      this.updateRenderItems();
      this.resetStartPosition();
      this.updateNavigation();
    });

    this.itemsElements.changes.subscribe(data => {
      this.resetStartPosition();
      this.updateNavigation();
    });
  }

  updateRenderItems() {
    if (this.data.length <= this.activeCount) {
      this.renderItems = this.data.map(el => ({...el}));
      this.renderItems.forEach( el => {
        el.isActive = true;
        el.isPrev = false;
        el.isNext = false;
        el.isBefore = false;
        el.transform = '';
      });
      this.isNavAvailable = false;
      return;
    }
    this.isNavAvailable = true;

    const active = this.data.slice(this.currentTile, this.currentTile + this.activeCount);
    const act = active.map( el => ({...el}));
    act.forEach( el => {
      el.isActive = true ;
      el.isPrev = false;
      el.isNext = false;
      el.isBefore = false;
      el.transform = '';
    });

    let prev = [];
    if (this.currentTile === 0) {
      prev = this.data.slice(-(this.activeCount + 1));
    }

    else if (this.currentTile < this.activeCount + 1) {
      prev.push(this.data[this.data.length - 1]);
      prev.push(...this.data.slice(0, this.currentTile));
    }
    else {
      prev = this.data.slice(this.currentTile - 1 - this.activeCount, this.currentTile);
    }

    const prv = prev.map( el => ({...el}));
    prv.forEach( (el, idx) => {
      el.isActive = false ;
      el.isPrev = idx !== 0;
      el.isBefore = true;
      el.isNext = false;
      el.transform = '';
    });

    let next = [];
    const end = this.currentTile + this.activeCount;

    if (end === this.data.length) {
      next = this.data.slice(0, this.activeCount + 1);
    }
    else if (this.data.length - 1 - end < this.activeCount) {
      next.push(...this.data.slice(end));
      next.push(this.data[0]);
    }
    else {
      next.push(...this.data.slice(end, end + this.activeCount + 1));
    }

    const nxt = next.map(el => ({...el}));
    nxt.forEach( (el, idx) => {
      el.isActive = false;
      el.isPrev = false;
      el.isNext = idx !== (next.length - 1);
      el.isBefore = false;
      el.transform = '';
    });

    this.renderItems = prv.concat(act).concat(nxt);
  }

  resetStartPosition() {

    // get before "active" items position
    this.currentOffset = this.itemsElements
      .filter(el => el.nativeElement.classList.contains('before-tile'))
      .reduce((prev, curr, idx) => {
        return prev + curr.nativeElement.offsetWidth;
      }, 0);

    const myAnimation: AnimationFactory = this.buildAnimation(0, this.currentOffset);
    this.player = myAnimation.create(this.carousel.nativeElement);
    this.player.play();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setActiveCount();
    this.updateRenderItems();
    this.resetStartPosition();
  }

  setActiveCount() {
    if (this.fixedTileCount) {
      this.activeCount = this.fixedTileCount;
      return;
    }

    if (this.isFullScreen) {
      const windowWidth = window.innerWidth;
      if (windowWidth < 500) {
        this.activeCount = 2;
      }
      else if (windowWidth < 800) {
        this.activeCount = 3;
      }
      else if (windowWidth < 1100) {
        this.activeCount = 4;
      }
      else if (windowWidth < 1400) {
        this.activeCount = 5;
      }
      else {
        this.activeCount = 6;
      }
    }
    else {
      const windowWidth = window.innerWidth;
      if (windowWidth < 500) {
        this.activeCount = 1;
      }
      else if (windowWidth < 800) {
        this.activeCount = 2;
      }
      else if (windowWidth < 1100) {
        this.activeCount = 2;
      }
      else if (windowWidth < 1400) {
        this.activeCount = 3;
      }
      else {
        this.activeCount = 3;
      }
    }
  }

  getNextOffset() {
    return this.itemsElements
      .filter(el => el.nativeElement.classList.contains('next-tile'))
      .reduce((prev, curr, idx) => {
        return prev + curr.nativeElement.offsetWidth;
      }, 0);
  }

  getNextTileIndex() {
    const result = this.currentTile + this.activeCount;
    if (result >= this.data.length) {
      return 0;
    }
    if (result > this.data.length - this.activeCount) {
      return this.data.length - this.activeCount;
    }
    return result;
  }

  next() {
    if (this.isScrolled) {
      return;
    }

    this.currentTile = this.getNextTileIndex();
    const offset = this.getNextOffset() + this.currentOffset;
    const myAnimation: AnimationFactory = this.buildAnimation(this.slideTiming, offset);
    this.player = myAnimation.create(this.carousel.nativeElement);
    this.player.onDone(() => {
      this.updateRenderItems();
      this.updateNavigation();
      this.isScrolled = false;
    });
    this.isScrolled = true;
    this.player.play();
  }

  getPrevTileIndex() {
    const result = this.currentTile - this.activeCount;

    if (this.currentTile === 0) {
      return this.data.length - this.activeCount;
    }

    if (result < 0) {
      return 0;
    }
    return result;
  }

  getPrevOffset() {
    return this.itemsElements
      .filter(el => el.nativeElement.classList.contains('prev-tile'))
      .reduce((prev, curr, idx) => {
        return prev + curr.nativeElement.offsetWidth;
      }, 0);
  }

  prev() {
    if (this.isScrolled) {
      return;
    }

    this.currentTile = this.getPrevTileIndex();
    const offset = -this.getPrevOffset() + this.currentOffset;
    const myAnimation: AnimationFactory = this.buildAnimation(this.slideTiming, offset);
    this.player = myAnimation.create(this.carousel.nativeElement);
    this.player.onDone(() => {
     this.updateRenderItems();
     this.updateNavigation();
     this.isScrolled = false;
    });
    this.isScrolled = true;
    this.player.play();
  }


  private buildAnimation( timing, offset ) {
    return this.builder.build([
      animate(timing, style({ transform: `translateX(-${offset}px)`, transformOrigin: 'center center' }))
    ]);
  }

  get isDetailed() {
    return !!this.detailedCourseId;
  }

  mouseenter(ev, index) {
    if (!this.isHoverable) {
      return;
    }

    if (this.isDetailed) {
      return;
    }

    this.animateTilesOffset(index);
    this.hoveredIdxChange.emit(this.hoveredIdx);
  }

  mouseleave(ev, index) {
    if (!this.isHoverable) {
      return;
    }

    if (this.hoveredIdx === index) {
      this.hoveredIdx = null;
      this.resetTilesAnimation();
      this.hoveredIdxChange.emit(this.hoveredIdx);
    }
  }

  updateNavigation() {
    const slideCount = Math.ceil(this.data.length / this.activeCount);
    const activeSlide = Math.ceil(this.currentTile / this.activeCount);

    const arr = new Array(slideCount);
    arr.fill(false);
    arr[activeSlide] = true;
    this.navigationArray = arr;
  }

  animateTilesOffset(hoveredIndex) {
    const tileWidth = this.itemsElements.toArray()[hoveredIndex].nativeElement.offsetWidth;
    const scaledWidth = (tileWidth * this.scaleValue);
    const diff  = scaledWidth - tileWidth;

    let firstIndex = null;
    let lastIndex = null;
    this.renderItems.forEach((el, i) => {
      if (el.isActive) {
        lastIndex = i;
        if (firstIndex === null) {
          firstIndex = i;
        }
      }
    });

    if (lastIndex < this.activeCount - 1) {
      lastIndex = this.activeCount - 1;

    }

    let offsetLeft = 0;
    let offsetRight = 0;
    if (hoveredIndex === firstIndex) {
      offsetRight = diff;
    }
    else if (hoveredIndex === lastIndex) {
      offsetLeft = -diff;
    }
    else {
      offsetLeft = -diff / 2;
      offsetRight = diff / 2;
    }

    this.offsetLeft = offsetLeft;
    this.offsetRight = offsetRight;
    this.firstIndex = firstIndex;
    this.lastIndex = lastIndex;

    this.hoveredIdx = hoveredIndex;
    this.renderItems.forEach((el, i) => {
      if (i < hoveredIndex) {
        el.transform = `translateX(${offsetLeft}px)`;
        return;
      }
      if (i > hoveredIndex) {
        el.transform = `translateX(${offsetRight}px)`;
        return;
      }

      let offset = 0;
      if (i === firstIndex) {
        offset = offsetRight / 2;
      }
      else if (i === lastIndex) {
        offset = offsetLeft / 2;
      }
      else {
        offset = 0;
      }

      el.transform = `translateX(${offset}px)`;
    });
  }

  resetTilesAnimation() {
    this.renderItems.forEach(el => {
      el.transform = '';
    });
  }

  onTileDetailsClick(data) {
    this.detailsClick.emit(data);
  }

  onCurrentTimeInactive(data) {
    this.data.forEach(el => {
      if (el.id === data.id) {
        el.currentTime = data.currentTime;
      }
    });

    this.renderItems.forEach(el => {
      if (el.id === data.id) {
        el.currentTime = data.currentTime;
      }
    });
  }

  reinitDataChanges() {
    if (!this._isViewInit) {
      return;
    }

    this.setActiveCount();
    this.updateRenderItems();
    this.resetStartPosition();
    this.updateNavigation();
  }
}
