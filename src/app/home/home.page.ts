import { Component } from '@angular/core';
import { MovieDBService } from '../movie-db.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  movies: any;
  initMovies: any;
  // sortToggle: boolean = false;

  constructor(private movie: MovieDBService, private alertCont: AlertController) {
    console.log(JSON.parse(localStorage.getItem("array")));
  }

  ngOnInit() {
    this.movie.getByKeywordIDChrono().subscribe(data => {
      console.log(data)
      // console.log(data['total_pages'])

      let storedRankings = localStorage.getItem("array");
      // If movie exists that was not ranked before
      if (!storedRankings || data['total_results'].length > JSON.parse(storedRankings).length) {
        if (data['total_pages'] > 1 ) {
          this.movies = [];
          this.initMovies = [];
          this.pushMovies(data); // Pushes 1st page results before looping over next pages
          for (let i = 2; i <= data['total_pages']; i++) {
            this.movie.getByKeywordIDChronoNextPage(i).subscribe(data => {
              console.log(data)
              this.pushMovies(data);
            })
          }
        }
        if (data['total_pages'] == 1) {
          this.movies = data['results']
          this.initMovies = data['results']
        }
      }
      else {
        this.movies = JSON.parse(localStorage.getItem("array"));
      }

    })
  }

  pushMovies(data) {
    for (let i = 0; i < data['results'].length; i++) {
      const element = data['results'][i];
      // console.log(element)

      this.movie.getMovieByID(element.id).subscribe(data => {
        console.log(data)
      })

      this.movies.push(element)
      this.initMovies.push(element);
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

  share() {
    let textBody: string = '';
    for (let i = 0; i < this.movies.length; i++) {
      const element = this.movies[i];
      i + 1 != this.movies.length ? textBody += `${i + 1}. ${element.title}%0D%0A` : textBody += `${i + 1}. ${element.title}`
      // textBody += `${i + 1}. ${element.title}%0D%0A`
      console.log(textBody)
    }
    window.open(`sms:?&body=${textBody}`, '_parent');
  }

  async reset() {
    // this.movies = this.initMovies;

      const alert = await this.alertCont.create({
        header: 'Reset?',
        message: 'Would you like to reset your ratings to chronological order?',
        buttons: [
          {
            text: 'Cancel',
            role: 'cancel',
            cssClass: 'alertBtn',
            handler: (blah) => {
              console.log('Confirm Cancel: blah');
            }
          }, {
            text: 'Reset',
            cssClass: 'alertBtn danger',
            handler: () => {
              console.log('Confirm Okay');
            }
          }
        ]
      });
  
      await alert.present();

    
  }

}
