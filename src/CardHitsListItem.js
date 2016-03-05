import * as React from "react";
import * as ReactDOM from "react-dom";
import * as _ from "lodash";
import "searchkit/theming/theme.scss";
import "./styles/customisations.scss";
var ent = require('ent');
const nl2br = require('react-nl2br');
var Carousel = require('nuka-carousel');
var Slider = require('react-slick');
var ReactTabs = require('react-tabs');
var Tab = ReactTabs.Tab;
var Tabs = ReactTabs.Tabs;
var TabList = ReactTabs.TabList;
var TabPanel = ReactTabs.TabPanel;

var CardHitsListItem = React.createClass({
	getInitialState: function() {  	
	    var {bemBlocks, result} = this.props;
	    var source = result._source;
	    // At some point, have all multiverse-specific stuff (id, flavour text, original text) as states.
	    // Then, when you click the symbol, all we have to do is load that multi's data into the states which are already in the renderer.
        return {
            clickedCard: '',
            currentMultiId: source.multiverseids[result._source.multiverseids.length - 1].multiverseid,
            currentArtist: source.multiverseids[result._source.multiverseids.length - 1].artist,
            currentFlavor: source.multiverseids[result._source.multiverseids.length - 1].flavor,
            currentOriginalText: source.multiverseids[result._source.multiverseids.length - 1].originalText,
            currentSetName: source.multiverseids[result._source.multiverseids.length - 1].setName,
            currentSelectedTab: 0
        };
    },

    handleClick(source) {
	    // If clicked on a different card, change the name.
	    if (this.state.clickedCard != source.name)
	    {
	      this.setState({clickedCard: source.name});
	    }
	    // Else, we clicked on the same card, so shrink.
	    else {
	      this.setState({clickedCard: ''});
	    }
	    //document.addEventListener("click", this.hide.bind(this));
	},
	
	handleTabSelect(index, last) {
		this.setState({currentSelectedTab: index});
	},

	handleSetIconClick(multi) {
		// Set the new multiId. Eventually this will work for flavour and original text too.
		this.setState({currentMultiId: multi.multiverseid,
			currentArtist: multi.artist,
			currentFlavor: multi.flavor,
			currentOriginalText: multi.originalText,
			currentSetName: multi.setName});
	},

	onLanguageHover(language) {
		console.log('new multiId is ' + language.multiverseid );
		this.setState({currentMultiId: language.multiverseid});
	},

    getSetIcons: function(source) {
    	// Loop through all multiverseIds, which have their own set code and rarity.
    	var setImages = source.multiverseids.map(function(multis, i) {
      		let rarity = multis.rarity.charAt(0) == "B" ? "C" : multis.rarity.charAt(0); // Replace 'basic' rarity with common.
      		let url = "http://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=" + multis.multiverseid;
      		return (
            	<img className={(this.state.currentMultiId == multis.multiverseid ? "clicked " : "") + "setIcon " + rarity } src={'./src/img/sets/' + multis.setName.replace(/\s+/g,'').replace(":","").replace('"','').replace('"','').toLowerCase() + '-' + rarity + '.jpg'} 
	                title={multis.setName}
	                onClick={this.handleSetIconClick.bind(this, multis)}/>
	            )
	    	}.bind(this))
    	return setImages;
  	},

  	generateTitleCostSymbols: function(source) {
		// Take the manacost and return a bunch of img divs.
		var tagged;
		if (source !== undefined) {
		    source = source.replace(/\//g,''); // Get rid of / in any costs first.
		    // Check that match returns anything.
		    if (source.match(/\{([0-z,½,∞]+)\}/g)) {
			    tagged = source.match(/\{([0-z,½,∞]+)\}/g)
		    	.map(function (basename, i) {
		        	var src = './src/img/' + basename.substring(1, basename.length - 1).toLowerCase() + '.png';
		            return <img key={i} src={src} height='15px'/>;
		        });
		    }
		}
		return tagged;
	},

	generateTextCostSymbols: function(source) {
		var tagged;
		if (source !== undefined) {
		    // Get rid of / in any costs first, but only if inside {} brackets (so as not to affect +1/+1).
		    source = source.replace(/(\/)(?=\w\})/g,'');
		    // Then generate the tags through setting the innerHtml. This is the only way to preserve the text around the img tags.
		    // Encode the source in html, to prevent XSS nastiness. Then replace the newlines with <br/>. Then insert the <img> tags.
		    tagged = <div dangerouslySetInnerHTML={{__html: ent.encode(source).replace(/&#10;/g, '<br/>').replace(/\{([0-z,½,∞]+)\}/g, (fullMatch, firstMatch) =>
		        `<img src=./src/img/${firstMatch.toLowerCase()}.png height=12px/>`
		    )}}></div>
		}
		return tagged;
	},

	render: function() {
		// Temporary slider test stuff.
		var settings = {
	      dots: true,
	      infinite: false,
	      speed: 500,
	      slidesToShow: 1,
	      slidesToScroll: 1
	    };

	    var {bemBlocks, result} = this.props;
	    var source = result._source;
	    let url = "http://gatherer.wizards.com/Pages/Card/Details.aspx?multiverseid=" + this.state.currentMultiId;
	    let imgUrl = 'https://image.deckbrew.com/mtg/multiverseid/' + this.state.currentMultiId + '.jpg';
	    // Generate the mana symbols in both cost and the card text.	    
	    source.tagCost = this.generateTitleCostSymbols(source.manaCost);
	    source.taggedText = this.generateTextCostSymbols(source.text);

	    // Define 'details' tab information here.
	    var extraInfo, flavour, pt, legalities;
    	if (source.power) {
    		pt = ( <div>		
		        <span className={bemBlocks.item("subtitle")}><b>{'P/T: '}</b></span><span className={bemBlocks.item("subtitle")}>{source.power + '/' + source.toughness}</span>
		        <br/>
	        </div> )
    	}
    	if (this.state.currentFlavor) {
    		flavour = ( <div>		
		        <span className={bemBlocks.item("subtitle")}><b>{'Flavour: '}</b></span><span className={bemBlocks.item("subtitle")}>{nl2br(this.state.currentFlavor)}</span>
		        <br/>
	        </div> )
    	}
    	else { flavour = <div/> }
    	extraInfo = (
    		<div>	
		        <span className={bemBlocks.item("subtitle")}><b>{'Set: '}</b></span><span className={bemBlocks.item("subtitle")}>{this.state.currentSetName + ' (#' + source.number + ')'}</span>
		        <br/>
		        <span className={bemBlocks.item("subtitle")}><b>{'Artist: '}</b></span><span className={bemBlocks.item("subtitle")}>{this.state.currentArtist}</span>
		        <br/>
	        </div>
    	)
    	if (source.legalities) {
	    	legalities = (<div>
		        <span className={bemBlocks.item("subtitle")}><b>{'Legalities: '}</b></span>
		        { source.legalities.map(function(legality, i) {
		        	return <div><span className={legality.legality == "Banned" ? bemBlocks.item("subtitle") + ' banned' : bemBlocks.item("subtitle") + ' legal'}>{legality.format + ': ' + legality.legality}</span><br/></div>
		        })}
		        </div>
	    	)
	    }
    	else { pt = <div/> }

    	// Define rulings here.
    	var rulings;
    	if (source.rulings) {
    		rulings = (<div>
    			{ source.rulings.map(function(ruling, i) {
    				return <div><span className={bemBlocks.item("subtitle")}><b>{ruling.date + ": "}</b></span>
    							<span className={bemBlocks.item("subtitle")}>{this.generateTextCostSymbols(ruling.text)}</span></div>
    			}.bind(this))}
    			</div>
    		)
    	}
    	else {
    		rulings = <div><span className={bemBlocks.item("subtitle")}>No rulings!</span></div>;
    	}

    	// Define languages here.
    	var languages;
    	if (source.foreignNames) {
    		languages = (<div>
    			{ source.foreignNames.map(function(language, i) {
    				return <div ><span onMouseOver={this.onLanguageHover.bind(this, language)} className={bemBlocks.item("subtitle")}><b>{language.language + ": "}</b></span>
    							<span onMouseOver={this.onLanguageHover.bind(this, language)} className={bemBlocks.item("subtitle")}>{language.name}</span></div>
    			}.bind(this))}
    			</div>
    		)
    	}
    	else {
    		languages = <div><span className={bemBlocks.item("subtitle")}>No other languages!</span></div>;
    	}

    	// Define comments!

    	// Define prices!

    	// Define the tab stuff here.
    	var selectedInfo;
	    if (this.state.clickedCard) {
        	selectedInfo = (<Tabs selectedIndex={this.state.currentSelectedTab} onSelect={this.handleTabSelect}>
        		<TabList>
	        		<Tab>Details</Tab>
	            	<Tab>Rulings</Tab>
	            	<Tab>Languages</Tab>
	            	<Tab>Comments</Tab>
	            	<Tab>Prices</Tab>
	        	</TabList>
            	<TabPanel>
					<div className='extraDetails'>{flavour}{extraInfo}{legalities}</div> 
		        </TabPanel>
		        <TabPanel>
		          <div className='extraDetails'>{rulings}</div> 
		        </TabPanel>
		        <TabPanel>
		          <div className='extraDetails'>{languages}</div> 
		        </TabPanel>
		        <TabPanel>
		          <h2>Hello from afgaesfgaesg</h2>
		        </TabPanel>
		        <TabPanel>
		          <h2>Hello from expensive card!</h2>
		        </TabPanel>
        	</Tabs>)
	    }
	    else {
	    	selectedInfo = <div/>
	    }
	    // In the style for the set icons, 'relative' enables cards like Forest to grow the div around them to fit all the symbols.
	    // In the future, might want an 'open/close' <p> tag for that, since it's pretty useless seeing all those symbols anyway.
	    // The <p> tag helps to align the symbols in the centre, and probably other important css-y stuff.
	    /*<Carousel slidesToShow={2} cellAlign="center" cellSpacing={20}  slideWidth="500px">
        <img src="http://placehold.it/1000x400/ffffff/c0392b/&text=slide1"/>
        <img src="http://placehold.it/1000x400/ffffff/c0392b/&text=slide2"/>
        <img src="http://placehold.it/1000x400/ffffff/c0392b/&text=slide3"/>
        <img src="http://placehold.it/1000x400/ffffff/c0392b/&text=slide4"/>
        <img src="http://placehold.it/1000x400/ffffff/c0392b/&text=slide5"/>
        <img src="http://placehold.it/1000x400/ffffff/c0392b/&text=slide6"/>
      </Carousel>

    			<div className='container'>
      			</div>
      <Slider {...settings}>
        
						<div className='extraDetails'>{flavour}{extraInfo}{legalities}</div> 
        <div><h3>2</h3></div>
        <div><h3>3</h3></div>
        <div><h3>4</h3></div>
        <div><h3>5</h3></div>
        <div><h3>6</h3></div>
      </Slider>*/
	    // this.state.clickedCard is '' when unclicked, which is apparently false-y enough to use for a bool.
	    return (
	    	<div className={bemBlocks.item().mix(bemBlocks.container("item"))} style={{display: 'block'}}>
	    		<div style={{display: 'flex'}}>
		    		<div className='listImg' style={{display:'inline-block'}}>
		          		<img className={(this.state.clickedCard ? "clicked " : "") + "listImg"}
		            		src={imgUrl} 
		            		style={{borderRadius: this.state.clickedCard ? "10" : "3"}} 
		            		width="100"
		            		onClick={this.handleClick.bind(this, source)} />
		        	</div>
		        	<div style={{width:'100%'}}>
		        		<div  style={{display:'flex'}}>
				        	<div className={bemBlocks.item("details")} style={{display:'inline-block'}}>
				        		<a href={'http://shop.tcgplayer.com/magic/' + this.state.currentSetName.replace(/[^\w\s]/gi, '') + '/' + source.name} target="_blank">
				         			<h2 className={bemBlocks.item("title")}>{source.name} {source.tagCost} ({source.cmc ? source.cmc : 0})</h2>
				         		</a>
						        <h3 className={bemBlocks.item("subtitle")}><b>{source.type}</b></h3>
						        <h3 className={bemBlocks.item("subtitle")}>{source.taggedText}{pt}</h3></div>
				        	<div style={{width: '150px', position: 'relative', right: '10px', display:'inline-block'}}>
				          		<p style={{textAlign:'center'}}>{this.getSetIcons(source)}</p>
				        	</div>	
				        </div>
	        			<div className={bemBlocks.item("details")}>{selectedInfo}</div>
		        	</div>			        
	        	</div>
	      	</div>
	    )
	}
});

export default CardHitsListItem;