import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { MovieDBCordovaService } from '../movie-db.service';
import { MovieDBWebService } from '../movie-dbweb.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  movies: any;
  initMovies: any;
  sortToggle: boolean = false;

  constructor(private movieC: MovieDBCordovaService, private movieW: MovieDBWebService, private plt: Platform) {

    this.plt.ready().then(() => {
      if (this.plt.is('cordova')) {
        // make your native API calls
        console.log('cordova')
        this.movieC.getByKeywordIDChrono().then(data => {
          // console.log(data)
          // console.log(data['total_pages'])
          if (data['total_pages'] > 1 ) {
            this.movies = [];
            this.initMovies = [];
            this.pushMoviesCordova(data); // Pushes 1st page results before looping over next pages
            for (let i = 2; i <= data['total_pages']; i++) {
              this.movieC.getByKeywordIDChronoNextPage(i).then(data => {
                console.log(data)
                this.pushMoviesCordova(data);
              })
            }
          }
        })
        
      } else {
        // fallback to browser APIs
        console.log('!cordova')
        this.movieW.getByKeywordIDChrono().subscribe(data => {
          // console.log(data)
          // console.log(data['total_pages'])
          if (data['total_pages'] > 1 ) {
            this.movies = [];
            this.initMovies = [];
            this.pushMoviesWeb(data); // Pushes 1st page results before looping over next pages
            for (let i = 2; i <= data['total_pages']; i++) {
              this.movieW.getByKeywordIDChronoNextPage(i).subscribe(data => {
                console.log(data)
                this.pushMoviesWeb(data);
              })
            }
          }
        })

      }
    });

  }

  pushMoviesCordova(data) {
    for (let i = 0; i < data['results'].length; i++) {
      const element = data['results'][i];
      // console.log(element)

      this.movieC.getMovieByID(element.id).then(data => {
        console.log(data)
      })

      this.movies.push(element)
      this.initMovies.push(element);
    }
  }

  pushMoviesWeb(data) {
    for (let i = 0; i < data['results'].length; i++) {
      const element = data['results'][i];
      // console.log(element)

      this.movieW.getMovieByID(element.id).subscribe(data => {
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
    
    let initIndex = this.initMovies.findIndex(obj => obj.id === itemMove.id);
    console.log(initIndex)

    for (let i = initIndex; i < ev.detail.to; i++) {
      const element = this.movies[i];
      let initIndex = this.initMovies.findIndex(obj => obj.id === this.movies[i].id);
      console.log(element, initIndex)
      
    }

  }

  toggleSort() {
    this.sortToggle = !this.sortToggle;
  }

}
