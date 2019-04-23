import { Component, OnInit } from '@angular/core';
import { MovieDBService } from '../movie-db.service';
import { AlertController, ActionSheetController } from '@ionic/angular';
import { ClipboardService } from 'ngx-clipboard'
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore } from '@angular/fire/firestore';
import { movieDBObj, movie } from '../movie-db-obj'

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {

  movies: movie[];
  storedRankings: string;
  isAndroid: boolean = false;
  uid: string;

  constructor(private movie: MovieDBService, private alertCont: AlertController, private actionCont: ActionSheetController, private clipboard: ClipboardService, private afAuth: AngularFireAuth, private af: AngularFirestore) {
    this.storedRankings = localStorage.getItem("array");
    // console.log(JSON.parse(this.storedRankings));
    if (!this.storedRankings) {
      this.movies = [];
    }
    else {
      this.movies = JSON.parse(localStorage.getItem("array"));
    }
    if (document.querySelector(".md")) {
      this.isAndroid = true;
    }
  }

  ngOnInit() {
    this.afAuth.authState.subscribe((user: {uid: string}) => {
      // console.log('authState', user);
      if (user) {
        this.uid = user.uid;
      }
      if (!user) {
        this.afAuth.auth.signInAnonymously().catch(error => {
          let errorCode = error.code;
          let errorMessage = error.message;
        });
      }
    })
    this.getMovies();
  }

  getMovies() {
    this.movie.getByKeywordIDChrono().subscribe((data: movieDBObj) => {
      // console.log(data)
      if (data.total_pages > 1) {
        // Pushes 1st page results before looping over next pages
        this.pushMovies(data);
        for (let i = 2; i <= data.total_pages; i++) {
          this.movie.getByKeywordIDChronoNextPage(i).subscribe((data: movieDBObj) => {
            // console.log(data)
            // Pass object from each additional page to pushMovies()
            this.pushMovies(data);
          })
        }
      }
      // Not needed as API returns > 1 page
      // if (data['total_pages'] == 1) {
      // }
    })
  }

  pushMovies(data: movieDBObj) {
    // Loop over each object in results array
    for (let i = 0; i < data.results.length; i++) {
      const element: movie = data.results[i];
      // console.log(element)
      // Find new items and push to array
      if (this.storedRankings) {
        const index: number = JSON.parse(this.storedRankings).map((obj: movie) => obj.title).indexOf(element['title']);
        if (index == -1) {
          // console.log("new item", element)
          this.movies.push(element)
        }
      }
      else {
        this.movies.push(element)
      }
    }
  }

  reorderItems(ev) {
    // console.log(ev.detail.to)
    const itemMove = this.movies.splice(ev.detail.from, 1)[0];

    this.movies.splice(ev.detail.to, 0, itemMove);
    ev.detail.complete();

    // Storing rankings as object array
    localStorage.setItem("array", JSON.stringify(this.movies));

    this.af.collection('reviews').doc(this.uid).set({ // Using set on first element to make sure UID exists in DB
      0: this.movies[0].title
    });
    for (let i = 1; i < this.movies.length; i++) {
      this.af.collection('reviews').doc(this.uid).update({
        [i]: this.movies[i].title
      });
    }

  }

  async share() {
    let textBody: string = `Here are my rankings for the MCU:%0D%0A`;
    for (let i = 0; i < this.movies.length; i++) {
      const element = this.movies[i];
      i + 1 != this.movies.length ? textBody += `${i + 1}. ${element.title}%0D%0A` : textBody += `${i + 1}. ${element.title}`
      // textBody += `${i + 1}. ${element.title}%0D%0A`
      // console.log(textBody)
    }
    textBody += `%0D%0A%0D%0AMake your rankings at marvelratings.firebaseapp.com`

    if (navigator['share']) {
      navigator['share']({
        title: 'Rank the MCU',
        text: textBody.replace(/%0D%0A/g, "\n"),
        // url: 'https://marvelratings.firebaseapp.com',
      })
      // .then(() => console.log('Successful share'))
      // .catch((error) => console.log('Error sharing', error));
    }
    else {
      let buttons = [{
        text: 'Text',
        handler: () => {
          window.open(`sms:?&body=${textBody}`, '_parent');
        }
      }, {
        text: 'Copy',
        handler: () => {
          // console.log('Share clicked');
          this.clipboard.copyFromContent(textBody.replace(/%0D%0A/g, "\n"))
        }
      }, {
        text: 'Twitter',
        handler: () => {
          // console.log('Share clicked');
          window.open(`https://twitter.com/intent/tweet?text=${textBody}`, '_parent');
        }
      }, {
        text: 'Facebook',
        handler: () => {
          // console.log('Play clicked');
          window.open(`https://www.facebook.com/sharer/sharer.php?u=https://marvelratings.firebaseapp.com&quote=${textBody}`, '_parent');
        }
      }, {
        text: 'Cancel',
        // icon: 'close',
        role: 'cancel',
        handler: () => {
          // console.log('Cancel clicked');
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
  }

  async resetPrompt() {
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
    this.movies = [];
    this.getMovies();
  }

}
