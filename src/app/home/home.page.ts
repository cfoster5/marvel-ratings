import { Component } from '@angular/core';
import { MovieDBService } from '../movie-db.service';
import { AlertController, ActionSheetController } from '@ionic/angular';
import { ClipboardService } from 'ngx-clipboard'


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  movies: any;
  initMovies: any;
  storedRankings: string;
  isAndroid: boolean = false;

  constructor(private movie: MovieDBService, private alertCont: AlertController, private actionCont: ActionSheetController, private clipboard: ClipboardService) {
    this.storedRankings = localStorage.getItem("array");
    console.log(JSON.parse(this.storedRankings));
    if (document.querySelector(".md")) {
      this.isAndroid = true;
    }
  }

  ngOnInit() {
    this.movie.getByKeywordIDChrono().subscribe(data => {
      console.log(data)
      // console.log(data['total_pages'])

      if (data['total_pages'] > 1 ) {
        this.initMovies = [];
        if (!this.storedRankings || data['total_results'].length > JSON.parse(this.storedRankings).length) {
          this.movies = [];
        }
        else {
          this.movies = JSON.parse(localStorage.getItem("array"));
        }
        this.pushMovies(data); // Pushes 1st page results before looping over next pages
        for (let i = 2; i <= data['total_pages']; i++) {
          this.movie.getByKeywordIDChronoNextPage(i).subscribe(data => {
            console.log(data)
            this.pushMovies(data);
          })
        }
      }
      // Not needed as API returns > 1 page
      // if (data['total_pages'] == 1) {
      //   this.initMovies = data['results']
      // }

    })
  }

  pushMovies(data) {
    for (let i = 0; i < data['results'].length; i++) {
      const element = data['results'][i];
      // console.log(element)

      this.movie.getMovieByID(element.id).subscribe(data => {
        console.log(data)
      })

      this.initMovies.push(element);
      
      if (!this.storedRankings || data['total_results'].length > JSON.parse(this.storedRankings).length) {
        this.movies.push(element)
      }
      else {
        this.movies = JSON.parse(localStorage.getItem("array"));
      }

    }
  }

  reorderItems(ev) {
    // console.log(this.initMovies)

    console.log(ev.detail.to)

    const itemMove = this.movies.splice(ev.detail.from, 1)[0];
    // if (itemMove.from == null) {
    //   itemMove.from = ev.detail.from;
    // }
    // itemMove.to = ev.detail.to;
    
    // itemMove.diff = Math.abs(itemMove.from - itemMove.to);
    this.movies.splice(ev.detail.to, 0, itemMove);
    ev.detail.complete();
    // console.log(itemMove)
    console.log(this.movies)

    // for (let i = 0; i < this.movies.length; i++) {
    //   const element = this.movies[i];
      
    // }

    // Storing rankings as object array
    localStorage.setItem("array", JSON.stringify(this.movies));
    
    // let initIndex = this.initMovies.findIndex(obj => obj.id === itemMove.id);
    // console.log(initIndex)

    // for (let i = initIndex; i < ev.detail.to; i++) {
    //   const element = this.movies[i];
    //   let initIndex = this.initMovies.findIndex(obj => obj.id === this.movies[i].id);
    //   console.log(element, initIndex)
    // }

  }

  // toggleSort() {
  //   this.sortToggle = !this.sortToggle;
  // }

  async share() {

    let textBody: string = `Here are my rankings for the MCU:%0D%0A`;
    for (let i = 0; i < this.movies.length; i++) {
      const element = this.movies[i];
      i + 1 != this.movies.length ? textBody += `${i + 1}. ${element.title}%0D%0A` : textBody += `${i + 1}. ${element.title}`
      // textBody += `${i + 1}. ${element.title}%0D%0A`
      console.log(textBody)
    }
    textBody += `%0D%0A%0D%0AMake your rankings at marvelratings.firebaseapp.com`
    // window.open(`sms:?&body=${textBody}`, '_parent');

    let buttons = [{
      text: 'Text',
      // icon: 'logo-twitter',
      handler: () => {
        window.open(`sms:?&body=${textBody}`, '_parent');
      }
    }, {
      text: 'Copy',
      // icon: 'logo-twitter',
      handler: () => {
        console.log('Share clicked');
        this.clipboard.copyFromContent(textBody.replace(/%0D%0A/g, "\n"))
      }
    }, {
      text: 'Twitter',
      // icon: 'logo-twitter',
      handler: () => {
        console.log('Share clicked');
        window.open(`https://twitter.com/intent/tweet?text=${textBody}`, '_parent');
      }
    }, {
      text: 'Facebook',
      // icon: 'arrow-dropright-circle',
      handler: () => {
        console.log('Play clicked');
        window.open(`https://www.facebook.com/sharer/sharer.php?u=https://marvelratings.firebaseapp.com&quote=${textBody}`, '_parent');
      }
    }, {
      text: 'Cancel',
      // icon: 'close',
      role: 'cancel',
      handler: () => {
        console.log('Cancel clicked');
      }
    }]

    if (this.isAndroid) {
      buttons.shift();
    }

    const actionSheet = await this.actionCont.create({
      // header: 'Platforms',
      buttons: buttons
    });
    await actionSheet.present();
  }

  async resetPrompt() {
    // this.movies = this.initMovies;

    const alert = await this.alertCont.create({
      header: 'Reset?',
      message: 'Would you like to reset your ratings to release order?',
      buttons: [{
        text: 'Cancel',
        role: 'cancel',
        cssClass: 'alertBtn',
        handler: (blah) => {
          // console.log('Confirm Cancel: blah');
        }
      }, {
        text: 'Reset',
        cssClass: 'alertBtn danger',
        handler: () => {
          // console.log('Confirm Okay');
          this.reset();
        }
      }]
    });

    await alert.present();
  }

  reset() {
    localStorage.removeItem("array")
    this.storedRankings = null;

    this.movie.getByKeywordIDChrono().subscribe(data => {
      console.log(data)
      // console.log(data['total_pages'])
      if (data['total_pages'] > 1 ) {
        this.initMovies = [];
        this.movies = [];
        this.pushMovies(data); // Pushes 1st page results before looping over next pages
        for (let i = 2; i <= data['total_pages']; i++) {
          this.movie.getByKeywordIDChronoNextPage(i).subscribe(data => {
            console.log(data)
            this.pushMovies(data);
          })
        }
      }
      // Not needed as API returns > 1 page
      // if (data['total_pages'] == 1) {
      //   this.initMovies = data['results']
      // }
    })

  }

}
