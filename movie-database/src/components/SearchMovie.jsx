import React from 'react';
import styles from './searchMovie.module.css'
import axios from 'axios'
import Loader from './Loader.gif'
// import PageNavigation from './PageNavigation'

class searchMovie extends React.Component{
    constructor(props){
        super(props)
        this.state = {
            query : '',
            results : {},
            loading: false,
            message: '',
            totalResults: 0,
			totalPages: 0,
			currentPageNo: 0

        };
        this.cancel = '';
    }

    getPageCount = (total, denominator) =>{
        const divisible = 0 === total % denominator;
        const valueToBeAdded = divisible ? 0 : 1;
        return Math.floor(total/denominator) + valueToBeAdded;
    };

    fetchSearchResults = (updatedPageNo = '', query) =>{
        const pageNumber = updatedPageNo ? `&page=${updatedPageNo}` : '';  
        const searchURL = `http://www.omdbapi.com/?i=tt3896198&apikey=8187ae11&s=${query}${pageNumber}`;

        if(this.cancel) {
            this.cancel.cancel();
        }
        this.cancel = axios.CancelToken.source();

        axios.get (searchURL, {
            CancelToken: this.cancel.token
        })
            .then(res => {
                // console.log(res)
                const total = res.data.totalResults;
                const totalPagesCount = this.getPageCount(total, 5);
                const resultNotFoundMsg = ! res.data.Search.length
										? 'There are no more search results. Please try a new search'
                                        : '';
                this.setState( {
                    results: res.data.Search,
                    message: resultNotFoundMsg,
                    totalResults:total,
                    totalPages: totalPagesCount,
                    currentPageNo: updatedPageNo,
                    loading: false
                })

            })
            .catch( error => {
                if(axios.isCancel(error) || error){
                    this.setState({
                        loading: false,
                        message: 'Failed to fetch data. Please check network'
                    })
                }
            })
    }

    handleOnInputChange = (event) => {
        const query = event.target.value;
        // console.log(query)
        if(!query){
            this.setState({ query, results:{}, message:'' });
        }else{
            this.setState( {query:query, loading: true, message: ''}, () => {
                this.fetchSearchResults( 1, query);
            });
        }
    };

    handlePageClick = ( type ) => {
        event.preventDefault();
        const updatePageNo = 'prev' === type 
                            ? this.state.currentPageNo-1 
                            : this.state.currentPageNo+1;
        if( ! this.state.loading  ) {
            this.setState( { loading: true, message: '' }, () => {
                this.fetchSearchResults( updatePageNo, this.state.query );
            } );
    }
    renderSearchResults = () => {
        const {results} = this.state;
        if(Object.keys(results).length && results.length) {
            return (
                <div className={styles.resultsContainer}>
                    {results.map(item=> {
                        return(
                            <a key={item.imdbID} href={item.Poster} className={styles.resultItem}>
                            <h6 className={styles.imageTitle}> { item.Title }</h6>
                            <div className={styles.imgWrapper}>
                                <img className={styles.image} src={item.Poster} alt={item.Title} />
                            </div>
                        </a>
                        )
                    })

                    }

                </div>
            )
        }
    }

    render(){
        const {query, loading, message, currentPageNo, totalPages } =  this.state;
        // const query = this.state.query;
        // console.log(this.state)
        const showPrevLink = 1 < currentPageNo;
        const showNextLink = totalPages > currentPageNo;

        return(
            <>
            <div className={styles.container}>
            <h2 className={styles.heading}>Movie Database Live Search</h2>   
            <label className={styles.searchLabel} htmlFor="search-input">
				<input
					type="text"
					name="query"
					value={ query }
					id="search-input"
					placeholder="Enter the Movie name ... "
					onChange={this.handleOnInputChange}
				/>
				{/* <i className = "fa fa-search search-input" aria-hidden="true"/> */}
			</label>  
            {/*	Error Message*/}
				{message && <p className={styles.message}>{ message }</p>}

            {/* loader  */}
            <img src={ Loader } className={`searchLoading ${ loading ? 'show' : 'hide' }`} alt="loader"/>
           
            {/* <PageNavigation 
                    loading= {loading}
                    showPrevLink={showPrevLink}
                    showNextLink={showNextLink}
                    handlePrevClick={this.handlePageClick(type:'prev')}
                    handleNextClick={this.handlePageClick(type:'next')}
            /> */}
            {/* Results    */}
            {this.renderSearchResults()}  
            {/* <PageNavigation 
                    loading= {loading}
                    showPrevLink={showPrevLink}
                    showNextLink={showNextLink}
                    handlePrevClick={this.handlePageClick(type:'prev')}
                    handleNextClick={this.handlePageClick(type:'next')}
            /> */}

            </div>
            </>
        )
    }
}

export default searchMovie;